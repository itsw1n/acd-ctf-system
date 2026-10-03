-- 014_remove_room_bans.sql — lock-only member control.
--
-- Bans are removed; locking holds the player instead. Convert each ban
-- into a locked PARTICIPANT membership (team unassigned, solves/score
-- untouched since they key on the player), then drop the table.

insert into public.room_memberships (room_id, player_id, role, team_id, access_locked)
select b.room_id, b.player_id, 'PARTICIPANT', null, true
from public.room_bans as b
where not exists (
  select 1 from public.room_memberships as m
  where m.room_id = b.room_id and m.player_id = b.player_id
);

drop index if exists public.room_bans_room_id_idx;
drop table if exists public.room_bans;
