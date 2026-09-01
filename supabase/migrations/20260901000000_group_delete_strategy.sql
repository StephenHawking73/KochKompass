begin;

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

  delete from public.favorites
  where meal_id in (
    select mp.id
    from public.meal_plan mp
    where mp.group_id = p_group_id
  );

  delete from public.ratings
  where recipe_id in (
    select r.id
    from public.recipes r
    where r.group_id = p_group_id
  );

  delete from public.meal_plan
  where group_id = p_group_id;

  delete from public.recipes
  where group_id = p_group_id;

  delete from public.group_invitations
  where group_id = p_group_id;

  delete from public.group_members
  where group_id = p_group_id;

  delete from public.groups
  where id = p_group_id;
end;
$$;

revoke all on function public.delete_group(uuid) from public;
grant execute on function public.delete_group(uuid) to authenticated;

commit;
