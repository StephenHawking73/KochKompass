-- Groups: only members can see their groups.
alter table public.groups
add column if not exists icon text not null default 'users',
add column if not exists accent_color text not null default '#82C05C',
add column if not exists design_variant text not null default 'fresh';

alter table public.recipes enable row level security;
alter table public.meal_plan enable row level security;

drop policy if exists groups_select_members on public.groups;
create policy groups_select_members
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

drop policy if exists groups_insert_own on public.groups;
create policy groups_insert_own
on public.groups
for insert
with check (created_by = auth.uid());

drop policy if exists groups_update_admins on public.groups;
create policy groups_update_admins
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

-- Recipes: private recipes belong to their creator, group recipes belong to group members.
drop policy if exists recipes_select_private_or_group on public.recipes;
create policy recipes_select_private_or_group
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

drop policy if exists recipes_insert_own on public.recipes;
create policy recipes_insert_own
on public.recipes
for insert
with check (
  created_by = auth.uid()
  and
  (
    group_id is null
    or exists (
      select 1
      from public.group_members gm
      where gm.group_id = recipes.group_id
        and gm.user_id = auth.uid()
    )
  )
);

drop policy if exists recipes_update_own on public.recipes;
create policy recipes_update_own
on public.recipes
for update
using (created_by = auth.uid())
with check (
  created_by = auth.uid()
  and
  (
    group_id is null
    or exists (
      select 1
      from public.group_members gm
      where gm.group_id = recipes.group_id
        and gm.user_id = auth.uid()
    )
  )
);

drop policy if exists recipes_delete_own on public.recipes;
create policy recipes_delete_own
on public.recipes
for delete
using (created_by = auth.uid());

-- Backfill existing private meal-plan rows from their recipe owner when possible.
update public.meal_plan mp
set
  user_id = coalesce(mp.user_id, mp.created_by, r.created_by),
  created_by = coalesce(mp.created_by, mp.user_id, r.created_by)
from public.recipes r
where mp.recipe_id = r.id
  and mp.group_id is null
  and (mp.user_id is null or mp.created_by is null);

-- Meal plan: private rows belong to one user, group rows belong to group members.
drop policy if exists meal_plan_select_private_or_group on public.meal_plan;
create policy meal_plan_select_private_or_group
on public.meal_plan
for select
using (
  (
    group_id is null
    and (user_id = auth.uid() or created_by = auth.uid())
  )
  or
  (
    group_id is not null and exists (
      select 1
      from public.group_members gm
      where gm.group_id = meal_plan.group_id
        and gm.user_id = auth.uid()
    )
  )
);

drop policy if exists meal_plan_insert_own on public.meal_plan;
create policy meal_plan_insert_own
on public.meal_plan
for insert
with check (
  (
    group_id is null
    and user_id = auth.uid()
    and (created_by is null or created_by = auth.uid())
  )
  or
  (
    group_id is not null
    and (created_by is null or created_by = auth.uid())
    and exists (
      select 1
      from public.group_members gm
      where gm.group_id = meal_plan.group_id
        and gm.user_id = auth.uid()
    )
  )
);

drop policy if exists meal_plan_update_own on public.meal_plan;
create policy meal_plan_update_own
on public.meal_plan
for update
using (
  (
    group_id is null
    and (user_id = auth.uid() or created_by = auth.uid())
  )
  or
  (
    group_id is not null and exists (
      select 1
      from public.group_members gm
      where gm.group_id = meal_plan.group_id
        and gm.user_id = auth.uid()
    )
  )
)
with check (
  (
    group_id is null
    and user_id = auth.uid()
    and (created_by is null or created_by = auth.uid())
  )
  or
  (
    group_id is not null and exists (
      select 1
      from public.group_members gm
      where gm.group_id = meal_plan.group_id
        and gm.user_id = auth.uid()
    )
  )
);

drop policy if exists meal_plan_delete_own on public.meal_plan;
create policy meal_plan_delete_own
on public.meal_plan
for delete
using (
  (
    group_id is null
    and (user_id = auth.uid() or created_by = auth.uid())
  )
  or
  (
    group_id is not null and exists (
      select 1
      from public.group_members gm
      where gm.group_id = meal_plan.group_id
        and gm.user_id = auth.uid()
    )
  )
);

-- Members: only members of the same group are visible.
drop policy if exists group_members_select_own_group on public.group_members;
create policy group_members_select_own_group
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

drop policy if exists group_members_insert_own on public.group_members;
create policy group_members_insert_own
on public.group_members
for insert
with check (user_id = auth.uid());
