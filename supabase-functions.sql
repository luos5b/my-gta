-- Fonction pour incrémenter un vote (créé la ligne si elle n'existe pas encore)
create or replace function increment_vote(p_category text, p_option_id text)
returns void as $$
begin
  insert into votes (category, option_id, count)
  values (p_category, p_option_id, 1)
  on conflict (category, option_id)
  do update set count = votes.count + 1;
end;
$$ language plpgsql;

-- Fonction pour incrémenter le nombre de participants
create or replace function increment_participants()
returns void as $$
begin
  update participants set count = count + 1 where id = 1;
end;
$$ language plpgsql;

-- Autoriser tout le monde à appeler ces deux fonctions
grant execute on function increment_vote(text, text) to anon, authenticated;
grant execute on function increment_participants() to anon, authenticated;
