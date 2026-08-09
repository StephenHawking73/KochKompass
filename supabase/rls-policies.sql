-- Gruppen: Nur Mitglieder dürfen Gruppen sehen
alter table public.groups
add column if not exists icon text not null default 'users',
add column if not exists accent_color text not null default '#82C05C',
add column if not exists design_variant text not null default 'fresh';

create policy if not exists groups_select_members
on public.groups
for select
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = groups.id
      and gm.user_id = auth.uid()
  )
);

create policy if not exists groups_insert_own
on public.groups
for insert
with check (created_by = auth.uid());

create policy if not exists groups_update_admins
on public.groups
for update
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = groups.id
      and gm.user_id = auth.uid()
      and gm.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = groups.id
      and gm.user_id = auth.uid()
      and gm.role = 'admin'
  )
);

-- Rezepte: Privat oder eigene Gruppe
create policy if not exists recipes_select_private_or_group
on public.recipes
for select
using (
  (group_id is null and created_by = auth.uid())
  or
  (
    group_id is not null and exists (
      select 1
      from public.group_members gm
      where gm.group_id = recipes.group_id
        and gm.user_id = auth.uid()
    )
  )
);

create policy if not exists recipes_insert_own
on public.recipes
for insert
with check (
  created_by = auth.uid()
);

create policy if not exists recipes_update_own
on public.recipes
for update
using (created_by = auth.uid());

create policy if not exists recipes_delete_own
on public.recipes
for delete
using (created_by = auth.uid());

-- Meal Plan: Privat oder eigene Gruppe
create policy if not exists meal_plan_select_private_or_group
on public.meal_plan
for select
using (
  group_id is null
  or
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = meal_plan.group_id
      and gm.user_id = auth.uid()
  )
);

create policy if not exists meal_plan_insert_own
on public.meal_plan
for insert
with check (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = meal_plan.group_id
      and gm.user_id = auth.uid()
  )
  or group_id is null
);

create policy if not exists meal_plan_update_own
on public.meal_plan
for update
using (
  group_id is null
  or exists (
    select 1
    from public.group_members gm
    where gm.group_id = meal_plan.group_id
      and gm.user_id = auth.uid()
  )
);

create policy if not exists meal_plan_delete_own
on public.meal_plan
for delete
using (
  group_id is null
  or exists (
    select 1
    from public.group_members gm
    where gm.group_id = meal_plan.group_id
      and gm.user_id = auth.uid()
  )
);

-- Mitglieder: Nur eigene Gruppe sichtbar
create policy if not exists group_members_select_own_group
on public.group_members
for select
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
  )
);

create policy if not exists group_members_insert_own
on public.group_members
for insert
with check (user_id = auth.uid());
