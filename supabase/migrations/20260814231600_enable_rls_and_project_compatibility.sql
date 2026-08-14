begin;

-- Keep helper functions independent from table RLS so policies can safely call them.
create or replace function public.is_group_member(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_group_id is not null
    and auth.uid() is not null
    and exists (
      select 1
      from public.group_members gm
      where gm.group_id = target_group_id
        and gm.user_id = auth.uid()
    );
$$;

create or replace function public.is_group_admin(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_group_id is not null
    and auth.uid() is not null
    and exists (
      select 1
      from public.group_members gm
      where gm.group_id = target_group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    );
$$;

create or replace function public.shares_group_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_user_id is not null
    and auth.uid() is not null
    and exists (
      select 1
      from public.group_members mine
      join public.group_members theirs
        on theirs.group_id = mine.group_id
      where mine.user_id = auth.uid()
        and theirs.user_id = target_user_id
    );
$$;

create or replace function public.can_access_recipe(target_recipe_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_recipe_id is not null
    and auth.uid() is not null
    and exists (
      select 1
      from public.recipes r
      where r.id = target_recipe_id
        and (
          (r.group_id is null and r.created_by = auth.uid())
          or
          (r.group_id is not null and public.is_group_member(r.group_id))
        )
    );
$$;

create or replace function public.recipe_matches_context(target_recipe_id uuid, target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_recipe_id is not null
    and auth.uid() is not null
    and exists (
      select 1
      from public.recipes r
      where r.id = target_recipe_id
        and (
          (target_group_id is null and r.group_id is null and r.created_by = auth.uid())
          or
          (target_group_id is not null and r.group_id = target_group_id and public.is_group_member(target_group_id))
        )
    );
$$;

create or replace function public.can_access_meal_plan(target_meal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_meal_id is not null
    and auth.uid() is not null
    and exists (
      select 1
      from public.meal_plan mp
      where mp.id = target_meal_id
        and (
          (mp.group_id is null and (mp.user_id = auth.uid() or mp.created_by = auth.uid()))
          or
          (mp.group_id is not null and public.is_group_member(mp.group_id))
        )
    );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  first_name text := nullif(new.raw_user_meta_data->>'first_name', '');
  last_name text := nullif(new.raw_user_meta_data->>'last_name', '');
  display_name text;
begin
  display_name := nullif(concat_ws(' ', first_name, last_name), '');

  insert into public.profiles (id, username, full_name, email)
  values (
    new.id,
    coalesce(first_name, nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    display_name,
    new.email
  )
  on conflict (id) do update
    set username = coalesce(excluded.username, public.profiles.username),
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        email = coalesce(excluded.email, public.profiles.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists groups_set_updated_at on public.groups;
create trigger groups_set_updated_at
  before update on public.groups
  for each row execute function public.update_updated_at_column();

create or replace function public.set_rating_group_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select r.group_id
    into new.group_id
  from public.recipes r
  where r.id = new.recipe_id;

  return new;
end;
$$;

drop trigger if exists ratings_set_group_id on public.ratings;
create trigger ratings_set_group_id
  before insert or update of recipe_id on public.ratings
  for each row execute function public.set_rating_group_id();

create or replace function public.promote_group_member(p_group_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_group_admin(p_group_id) then
    raise exception 'Nur Gruppenadmins koennen Mitglieder verwalten.';
  end if;

  update public.group_members
    set role = 'admin'
  where group_id = p_group_id
    and user_id = p_user_id;

  if not found then
    raise exception 'Mitglied wurde nicht gefunden.';
  end if;
end;
$$;

create or replace function public.remove_group_member(p_group_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role text;
  admin_count integer;
  member_count integer;
begin
  if not public.is_group_admin(p_group_id) then
    raise exception 'Nur Gruppenadmins koennen Mitglieder entfernen.';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Nutze leave_group, um die eigene Gruppe zu verlassen.';
  end if;

  select role
    into target_role
  from public.group_members
  where group_id = p_group_id
    and user_id = p_user_id;

  if target_role is null then
    raise exception 'Mitglied wurde nicht gefunden.';
  end if;

  select count(*), count(*) filter (where role = 'admin')
    into member_count, admin_count
  from public.group_members
  where group_id = p_group_id;

  if target_role = 'admin' and admin_count <= 1 and member_count > 1 then
    raise exception 'Der letzte Admin kann nicht entfernt werden.';
  end if;

  delete from public.group_members
  where group_id = p_group_id
    and user_id = p_user_id;
end;
$$;

create or replace function public.delete_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_group_admin(p_group_id) then
    raise exception 'Nur Gruppenadmins koennen Gruppen loeschen.';
  end if;

  delete from public.meal_plan
  where group_id = p_group_id;

  update public.ratings
    set group_id = null
  where group_id = p_group_id;

  update public.recipes
    set group_id = null
  where group_id = p_group_id;

  delete from public.groups
  where id = p_group_id;
end;
$$;

create or replace function public.leave_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  leaving_role text;
  member_count integer;
  admin_count integer;
  next_member_id uuid;
begin
  select role
    into leaving_role
  from public.group_members
  where group_id = p_group_id
    and user_id = auth.uid();

  if leaving_role is null then
    raise exception 'Du bist kein Mitglied dieser Gruppe.';
  end if;

  select count(*), count(*) filter (where role = 'admin')
    into member_count, admin_count
  from public.group_members
  where group_id = p_group_id;

  if member_count <= 1 then
    perform public.delete_group(p_group_id);
    return;
  end if;

  delete from public.group_members
  where group_id = p_group_id
    and user_id = auth.uid();

  if leaving_role = 'admin' and admin_count <= 1 then
    select id
      into next_member_id
    from public.group_members
    where group_id = p_group_id
    order by joined_at asc
    limit 1;

    update public.group_members
      set role = 'admin'
    where id = next_member_id;
  end if;
end;
$$;

revoke all on function public.promote_group_member(uuid, uuid) from public;
revoke all on function public.remove_group_member(uuid, uuid) from public;
revoke all on function public.leave_group(uuid) from public;
revoke all on function public.delete_group(uuid) from public;
grant execute on function public.promote_group_member(uuid, uuid) to authenticated;
grant execute on function public.remove_group_member(uuid, uuid) to authenticated;
grant execute on function public.leave_group(uuid) to authenticated;
grant execute on function public.delete_group(uuid) to authenticated;

drop index if exists public.recipes_title_lower_unique;
create unique index if not exists recipes_personal_title_lower_unique
  on public.recipes (created_by, lower(btrim(title)))
  where group_id is null and created_by is not null;
create unique index if not exists recipes_group_title_lower_unique
  on public.recipes (group_id, lower(btrim(title)))
  where group_id is not null;
create unique index if not exists meal_plan_personal_unique_position
  on public.meal_plan (user_id, planned_date, meal_type, position)
  where group_id is null and user_id is not null;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invitations enable row level security;
alter table public.recipes enable row level security;
alter table public.meal_plan enable row level security;
alter table public.ratings enable row level security;
alter table public.favorites enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, update, delete on public.group_members to authenticated;
grant select, insert, update, delete on public.group_invitations to authenticated;
grant select, insert, update, delete on public.recipes to authenticated;
grant select, insert, update, delete on public.meal_plan to authenticated;
grant select, insert, update, delete on public.ratings to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
grant select on public.recipe_ratings_summary to authenticated;

alter view public.recipe_ratings_summary set (security_invoker = true);

drop policy if exists "profiles_select_visible" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "groups_select_member_or_creator" on public.groups;
drop policy if exists "groups_insert_own" on public.groups;
drop policy if exists "groups_update_admin_or_creator" on public.groups;
drop policy if exists "groups_delete_admin_or_creator" on public.groups;
drop policy if exists "group_members_select_visible" on public.group_members;
drop policy if exists "group_members_insert_allowed" on public.group_members;
drop policy if exists "group_members_update_admin" on public.group_members;
drop policy if exists "group_members_delete_self_or_admin" on public.group_members;
drop policy if exists "group_invitations_select_allowed" on public.group_invitations;
drop policy if exists "group_invitations_insert_admin" on public.group_invitations;
drop policy if exists "group_invitations_update_admin_or_creator" on public.group_invitations;
drop policy if exists "group_invitations_delete_admin_or_creator" on public.group_invitations;
drop policy if exists "recipes_select_visible" on public.recipes;
drop policy if exists "recipes_insert_visible_context" on public.recipes;
drop policy if exists "recipes_update_visible_context" on public.recipes;
drop policy if exists "recipes_delete_visible_context" on public.recipes;
drop policy if exists "meal_plan_select_visible" on public.meal_plan;
drop policy if exists "meal_plan_insert_visible_context" on public.meal_plan;
drop policy if exists "meal_plan_update_visible_context" on public.meal_plan;
drop policy if exists "meal_plan_delete_visible_context" on public.meal_plan;
drop policy if exists "ratings_select_visible_recipe" on public.ratings;
drop policy if exists "ratings_insert_own_visible_recipe" on public.ratings;
drop policy if exists "ratings_update_own_visible_recipe" on public.ratings;
drop policy if exists "ratings_delete_own" on public.ratings;
drop policy if exists "favorites_select_own" on public.favorites;
drop policy if exists "favorites_insert_own_visible_recipe" on public.favorites;
drop policy if exists "favorites_update_own_visible_recipe" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;

create policy "profiles_select_visible"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.shares_group_with(id));

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "groups_select_member_or_creator"
  on public.groups
  for select
  to authenticated
  using (created_by = auth.uid() or public.is_group_member(id));

create policy "groups_insert_own"
  on public.groups
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "groups_update_admin_or_creator"
  on public.groups
  for update
  to authenticated
  using (created_by = auth.uid() or public.is_group_admin(id))
  with check (created_by = auth.uid() or public.is_group_admin(id));

create policy "groups_delete_admin_or_creator"
  on public.groups
  for delete
  to authenticated
  using (created_by = auth.uid() or public.is_group_admin(id));

create policy "group_members_select_visible"
  on public.group_members
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_group_member(group_id));

create policy "group_members_insert_allowed"
  on public.group_members
  for insert
  to authenticated
  with check (
    auth.uid() is not null
    and (
      (
        user_id = auth.uid()
        and role = 'admin'
        and exists (
          select 1
          from public.groups g
          where g.id = group_id
            and g.created_by = auth.uid()
        )
      )
      or
      (
        user_id = auth.uid()
        and role = 'member'
        and exists (
          select 1
          from public.group_invitations gi
          where gi.group_id = group_members.group_id
            and gi.is_active
            and (gi.expires_at is null or gi.expires_at > now())
        )
      )
      or public.is_group_admin(group_id)
    )
  );

create policy "group_members_update_admin"
  on public.group_members
  for update
  to authenticated
  using (public.is_group_admin(group_id))
  with check (public.is_group_admin(group_id));

create policy "group_members_delete_self_or_admin"
  on public.group_members
  for delete
  to authenticated
  using (user_id = auth.uid() or public.is_group_admin(group_id));

create policy "group_invitations_select_allowed"
  on public.group_invitations
  for select
  to authenticated
  using (
    public.is_group_admin(group_id)
    or created_by = auth.uid()
    or (is_active and (expires_at is null or expires_at > now()))
  );

create policy "group_invitations_insert_admin"
  on public.group_invitations
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.is_group_admin(group_id)
  );

create policy "group_invitations_update_admin_or_creator"
  on public.group_invitations
  for update
  to authenticated
  using (created_by = auth.uid() or public.is_group_admin(group_id))
  with check (created_by = auth.uid() or public.is_group_admin(group_id));

create policy "group_invitations_delete_admin_or_creator"
  on public.group_invitations
  for delete
  to authenticated
  using (created_by = auth.uid() or public.is_group_admin(group_id));

create policy "recipes_select_visible"
  on public.recipes
  for select
  to authenticated
  using (
    (group_id is null and created_by = auth.uid())
    or
    (group_id is not null and public.is_group_member(group_id))
  );

create policy "recipes_insert_visible_context"
  on public.recipes
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and (
      group_id is null
      or public.is_group_member(group_id)
    )
  );

create policy "recipes_update_visible_context"
  on public.recipes
  for update
  to authenticated
  using (
    (group_id is null and created_by = auth.uid())
    or
    (group_id is not null and public.is_group_member(group_id))
  )
  with check (
    (group_id is null and created_by = auth.uid())
    or
    (group_id is not null and public.is_group_member(group_id))
  );

create policy "recipes_delete_visible_context"
  on public.recipes
  for delete
  to authenticated
  using (
    (group_id is null and created_by = auth.uid())
    or
    (group_id is not null and public.is_group_member(group_id))
  );

create policy "meal_plan_select_visible"
  on public.meal_plan
  for select
  to authenticated
  using (
    (group_id is null and (user_id = auth.uid() or created_by = auth.uid()))
    or
    (group_id is not null and public.is_group_member(group_id))
  );

create policy "meal_plan_insert_visible_context"
  on public.meal_plan
  for insert
  to authenticated
  with check (
    auth.uid() is not null
    and (created_by is null or created_by = auth.uid())
    and (user_id is null or user_id = auth.uid())
    and (
      (
        group_id is null
        and (user_id = auth.uid() or created_by = auth.uid())
        and public.recipe_matches_context(recipe_id, null)
      )
      or
      (
        group_id is not null
        and public.is_group_member(group_id)
        and public.recipe_matches_context(recipe_id, group_id)
      )
    )
  );

create policy "meal_plan_update_visible_context"
  on public.meal_plan
  for update
  to authenticated
  using (public.can_access_meal_plan(id))
  with check (
    auth.uid() is not null
    and (created_by is null or created_by = auth.uid())
    and (user_id is null or user_id = auth.uid())
    and (
      (
        group_id is null
        and (user_id = auth.uid() or created_by = auth.uid())
        and public.recipe_matches_context(recipe_id, null)
      )
      or
      (
        group_id is not null
        and public.is_group_member(group_id)
        and public.recipe_matches_context(recipe_id, group_id)
      )
    )
  );

create policy "meal_plan_delete_visible_context"
  on public.meal_plan
  for delete
  to authenticated
  using (public.can_access_meal_plan(id));

create policy "ratings_select_visible_recipe"
  on public.ratings
  for select
  to authenticated
  using (public.can_access_recipe(recipe_id));

create policy "ratings_insert_own_visible_recipe"
  on public.ratings
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_access_recipe(recipe_id)
    and (group_id is null or public.is_group_member(group_id))
  );

create policy "ratings_update_own_visible_recipe"
  on public.ratings
  for update
  to authenticated
  using (user_id = auth.uid() and public.can_access_recipe(recipe_id))
  with check (
    user_id = auth.uid()
    and public.can_access_recipe(recipe_id)
    and (group_id is null or public.is_group_member(group_id))
  );

create policy "ratings_delete_own"
  on public.ratings
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy "favorites_select_own"
  on public.favorites
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "favorites_insert_own_visible_recipe"
  on public.favorites
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_access_recipe(meal_id)
  );

create policy "favorites_update_own_visible_recipe"
  on public.favorites
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and public.can_access_recipe(meal_id)
  );

create policy "favorites_delete_own"
  on public.favorites
  for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Full Access 1rpf4wn_0" on storage.objects;
drop policy if exists "Full Access 1rpf4wn_1" on storage.objects;
drop policy if exists "Full Access 1rpf4wn_2" on storage.objects;
drop policy if exists "Full Access 1rpf4wn_3" on storage.objects;
drop policy if exists "recipe_images_public_read" on storage.objects;
drop policy if exists "recipe_images_insert_own_folder" on storage.objects;
drop policy if exists "recipe_images_update_own_folder" on storage.objects;
drop policy if exists "recipe_images_delete_own_folder" on storage.objects;

create policy "recipe_images_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'recipe-images');

create policy "recipe_images_insert_own_folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "recipe_images_update_own_folder"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "recipe_images_delete_own_folder"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

commit;
