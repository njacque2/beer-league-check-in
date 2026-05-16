-- Seed data for local development
-- Run with: npx supabase db reset

-- League
INSERT INTO league (id, name, description) VALUES
  (1, 'Sunday Beer League', 'Casual beer league games on Sundays');

-- Season
INSERT INTO season (id, league_id, start_date, end_date, is_active) VALUES
  (1, 1, '2026-05-01', '2026-09-30', true);

-- Teams
INSERT INTO team (id, league_id, name) VALUES
  (1, 1, 'The Hops'),
  (2, 1, 'Barley Boys');

-- Upcoming games (future dates)
INSERT INTO games (id, season_id, game_time, location) VALUES
  (1, 1, '2026-05-20 19:00:00+00', 'Riverside Park Field 1'),
  (2, 1, '2026-05-27 19:00:00+00', 'Downtown Arena'),
  (3, 1, '2026-06-03 19:00:00+00', 'Riverside Park Field 1'),
  (4, 1, '2026-06-10 19:00:00+00', 'Eastside Complex'),
  (5, 1, '2026-06-17 19:00:00+00', 'Downtown Arena');

-- Game teams (each game has two teams)
INSERT INTO game_teams (id, game_id, team_id, is_home) VALUES
  (1, 1, 1, true),
  (2, 1, 2, false),
  (3, 2, 1, false),
  (4, 2, 2, true),
  (5, 3, 1, true),
  (6, 3, 2, false),
  (7, 4, 1, false),
  (8, 4, 2, true),
  (9, 5, 1, true),
  (10, 5, 2, false);

-- Reset sequences after explicit ID inserts
SELECT setval('public."League_id_seq"', 1);
SELECT setval('public."Team_id_seq"', 2);
SELECT setval('public.season_id_seq', 1);
SELECT setval('public.games_id_seq', 5);
SELECT setval('public.game_teams_id_seq', 10);
