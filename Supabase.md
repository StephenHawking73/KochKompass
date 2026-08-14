# KochKompass – Supabase Datenbankkontext

> **Zweck dieser Datei:** Diese Datei beschreibt den aktuell bekannten Zustand des Supabase-Projekts von KochKompass. Sie dient als Kontext für Codex.
>
> Die hier beschriebenen Strukturen wurden direkt aus dem aktuellen Supabase-Projekt ausgelesen. Bei Änderungen am Datenbankcode muss der bestehende Zustand berücksichtigt werden.
>
> **Wichtig:** Diese Datei ist eine Dokumentation des aktuellen Zustands und nicht die alleinige technische Wahrheit. Das tatsächlich verknüpfte Supabase-Projekt und dessen Migrationen haben Vorrang.

---

# 1. Technischer Überblick

KochKompass verwendet Supabase mit PostgreSQL.

Das aktuelle `public`-Schema enthält:

* `profiles`
* `groups`
* `group_members`
* `group_invitations`
* `recipes`
* `meal_plan`
* `ratings`
* `favorites`
* `recipe_ratings_summary` als View

Zusätzlich existiert der Supabase Storage Bucket:

* `recipe-images`

---

# 2. Wichtige globale Eigenschaften

## Row Level Security

Zum Zeitpunkt der Dokumentation ist **RLS auf keiner der abgefragten Tabellen im `public`-Schema aktiviert**.

Betroffene Tabellen:

* `favorites`
* `group_invitations`
* `group_members`
* `groups`
* `meal_plan`
* `profiles`
* `ratings`
* `recipes`

Die Datenbankabfragen haben für alle diese Tabellen ergeben:

```text
rowsecurity = false
forcerowsecurity = false
```

### Konsequenz für Codex

Nicht davon ausgehen, dass die bisher geplanten oder gewünschten RLS-Regeln bereits aktiv sind.

Wenn eine Aufgabe RLS betrifft, muss zunächst der tatsächliche aktuelle Zustand berücksichtigt werden.

---

# 3. Tabellen

## 3.1 `profiles`

Speichert das Benutzerprofil eines Supabase-Users.

### Spalten

| Spalte       | Typ         | NULL | Default                       |
| ------------ | ----------- | ---: | ----------------------------- |
| `id`         | uuid        | Nein | —                             |
| `username`   | text        |   Ja | —                             |
| `avatar_url` | text        |   Ja | voreingestellte Pinterest-URL |
| `created_at` | timestamptz |   Ja | `now()`                       |
| `email`      | text        |   Ja | —                             |
| `full_name`  | text        |   Ja | —                             |

### Primary Key

```text
profiles_pkey
```

auf:

```text
id
```

### Beziehungen

`profiles.id` wird von folgenden Tabellen referenziert:

* `favorites.user_id`
* `group_invitations.created_by`
* `group_members.user_id`
* `groups.created_by`
* `meal_plan.created_by`
* `meal_plan.user_id`
* `ratings.user_id`
* `recipes.created_by`

---

# 4. `groups`

Repräsentiert eine KochKompass-Gruppe.

### Spalten

| Spalte           | Typ         | NULL | Default             |
| ---------------- | ----------- | ---: | ------------------- |
| `id`             | uuid        | Nein | `gen_random_uuid()` |
| `name`           | text        | Nein | —                   |
| `created_by`     | uuid        |   Ja | `auth.uid()`        |
| `created_at`     | timestamptz | Nein | `now()`             |
| `max_meat`       | numeric     | Nein | `3`                 |
| `updated_at`     | timestamptz | Nein | `now()`             |
| `image_url`      | text        |   Ja | —                   |
| `icon`           | text        |   Ja | —                   |
| `accent_color`   | text        | Nein | `#82C05C`           |
| `design_variant` | text        | Nein | `fresh`             |

### Primary Key

```text
groups_pkey
```

auf:

```text
id
```

### Foreign Key

```text
groups.created_by
→ profiles.id
```

Bei Löschung des referenzierten Profils:

```text
ON DELETE SET NULL
```

### Index

```text
idx_groups_created_by
```

auf:

```text
created_by
```

---

# 5. `group_members`

Verknüpft Benutzer mit Gruppen und speichert deren Rolle.

### Spalten

| Spalte      | Typ         | NULL | Default             |
| ----------- | ----------- | ---: | ------------------- |
| `id`        | uuid        | Nein | `gen_random_uuid()` |
| `group_id`  | uuid        | Nein | —                   |
| `user_id`   | uuid        | Nein | —                   |
| `role`      | text        | Nein | `member`            |
| `joined_at` | timestamptz | Nein | `now()`             |

### Primary Key

```text
group_members_pkey
```

auf:

```text
id
```

### Foreign Keys

```text
group_members.group_id
→ groups.id
```

mit:

```text
ON UPDATE CASCADE
ON DELETE CASCADE
```

und:

```text
group_members.user_id
→ profiles.id
```

mit:

```text
ON UPDATE NO ACTION
ON DELETE CASCADE
```

### Unique Constraint

```text
UNIQUE (group_id, user_id)
```

Dadurch kann ein Benutzer nicht mehrfach derselben Gruppe zugeordnet werden.

### Rollen

Die erlaubten Rollen werden durch einen CHECK Constraint eingeschränkt:

```text
role = 'admin'
OR
role = 'member'
```

Der tatsächliche Constraint lautet:

```sql
CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text])))
```

### Indizes

```text
idx_group_members_group
```

auf:

```text
group_id
```

und:

```text
idx_group_members_user
```

auf:

```text
user_id
```

---

# 6. `group_invitations`

Speichert Einladungen zu Gruppen.

### Spalten

| Spalte       | Typ         | NULL | Default                                  |
| ------------ | ----------- | ---: | ---------------------------------------- |
| `id`         | uuid        | Nein | `gen_random_uuid()`                      |
| `group_id`   | uuid        | Nein | —                                        |
| `code`       | text        | Nein | automatisch generierter 8-stelliger Code |
| `created_by` | uuid        |   Ja | —                                        |
| `created_at` | timestamptz | Nein | `now()`                                  |
| `expires_at` | timestamptz |   Ja | —                                        |
| `is_active`  | boolean     | Nein | `true`                                   |

### Primary Key

```text
group_invitations_pkey
```

auf:

```text
id
```

### Foreign Keys

```text
group_invitations.group_id
→ groups.id
```

mit:

```text
ON DELETE CASCADE
```

und:

```text
group_invitations.created_by
→ profiles.id
```

mit:

```text
ON DELETE SET NULL
```

### Unique Constraint

```text
UNIQUE (code)
```

### Einladungscode

Der Default-Wert erzeugt einen Code aus einer UUID:

```sql
upper(
    substr(
        replace(gen_random_uuid()::text, '-', ''),
        1,
        8
    )
)
```

Damit wird ein Großbuchstaben-Code mit acht Zeichen erzeugt.

### Ablauf

Die Tabelle besitzt:

```text
expires_at
```

und:

```text
is_active
```

Es wurde jedoch **keine aktive Trigger-Funktion gefunden, die abgelaufene Einladungen automatisch löscht oder deaktiviert**.

Wenn eine Aufgabe dieses Verhalten implementieren soll, muss die dafür benötigte Logik explizit ergänzt werden.

---

# 7. `recipes`

Speichert Rezepte.

Ein Rezept kann entweder einem Benutzer persönlich oder einer Gruppe zugeordnet sein.

### Spalten

| Spalte         | Typ         | NULL | Default             |
| -------------- | ----------- | ---: | ------------------- |
| `id`           | uuid        | Nein | `gen_random_uuid()` |
| `created_at`   | timestamptz | Nein | `now()`             |
| `title`        | text        | Nein | `''`                |
| `description`  | text        |   Ja | —                   |
| `image_url`    | text        |   Ja | —                   |
| `attribute`    | text        |   Ja | —                   |
| `difficulty`   | text        |   Ja | —                   |
| `duration`     | numeric     |   Ja | —                   |
| `link`         | text        |   Ja | —                   |
| `created_by`   | uuid        |   Ja | `auth.uid()`        |
| `cooking_book` | text        |   Ja | `''`                |
| `group_id`     | uuid        |   Ja | —                   |

### Primary Key

```text
recipes_pkey
```

auf:

```text
id
```

### Foreign Keys

```text
recipes.created_by
→ profiles.id
```

mit:

```text
ON UPDATE CASCADE
ON DELETE SET NULL
```

und:

```text
recipes.group_id
→ groups.id
```

mit:

```text
ON UPDATE CASCADE
ON DELETE SET NULL
```

### Constraints

Der Titel darf nicht leer sein:

```sql
CHECK (length(TRIM(title)) > 0)
```

Zusätzlich existiert ein Unique Index:

```text
recipes_title_lower_unique
```

auf:

```sql
lower(TRIM(title))
```

Dadurch sind Rezepte mit identischem Titel unabhängig von Groß-/Kleinschreibung und führenden bzw. nachfolgenden Leerzeichen nicht mehrfach erlaubt.

### Indizes

```text
idx_recipes_created_by
```

auf:

```text
created_by
```

und:

```text
idx_recipes_group_id
```

auf:

```text
group_id
```

---

# 8. `meal_plan`

Speichert geplante Mahlzeiten.

### Spalten

| Spalte         | Typ     | NULL | Default             |
| -------------- | ------- | ---: | ------------------- |
| `id`           | uuid    | Nein | `gen_random_uuid()` |
| `planned_date` | date    | Nein | —                   |
| `recipe_id`    | uuid    | Nein | —                   |
| `meal_type`    | text    | Nein | `dinner`            |
| `position`     | integer | Nein | `0`                 |
| `group_id`     | uuid    |   Ja | —                   |
| `created_by`   | uuid    |   Ja | —                   |
| `user_id`      | uuid    |   Ja | —                   |

### Primary Key

```text
meals_pkey
```

auf:

```text
id
```

### Foreign Keys

```text
meal_plan.recipe_id
→ recipes.id
```

mit:

```text
ON DELETE CASCADE
```

```text
meal_plan.group_id
→ groups.id
```

mit:

```text
ON DELETE NO ACTION
```

```text
meal_plan.created_by
→ profiles.id
```

mit:

```text
ON DELETE CASCADE
```

```text
meal_plan.user_id
→ profiles.id
```

mit:

```text
ON UPDATE CASCADE
ON DELETE CASCADE
```

### Unique Constraint

```text
UNIQUE (
    group_id,
    planned_date,
    meal_type,
    position
)
```

Das bedeutet, dass dieselbe Kombination aus Gruppe, Datum, Mahlzeitentyp und Position nicht mehrfach vorkommen darf.

### Besonderheit

`group_id`, `created_by` und `user_id` sind nullable.

Die genaue fachliche Bedeutung dieser Kombination muss vom Anwendungscode berücksichtigt werden.

### Index

```text
idx_meal_plan_group_id
```

auf:

```text
group_id
```

---

# 9. `ratings`

Speichert Bewertungen von Rezepten.

### Spalten

| Spalte      | Typ      | NULL | Default |
| ----------- | -------- | ---: | ------- |
| `recipe_id` | uuid     | Nein | —       |
| `user_id`   | uuid     | Nein | —       |
| `rating`    | smallint | Nein | —       |
| `comment`   | text     |   Ja | `''`    |
| `group_id`  | uuid     |   Ja | —       |

### Primary Key

Der Primary Key ist **zusammengesetzt**:

```text
(recipe_id, user_id)
```

Constraint:

```text
ratings_pkey
```

Das bedeutet, dass ein Benutzer dasselbe Rezept nicht mehrfach in dieser Tabelle bewerten kann.

### Foreign Keys

```text
ratings.recipe_id
→ recipes.id
```

mit:

```text
ON DELETE CASCADE
```

```text
ratings.user_id
→ profiles.id
```

mit:

```text
ON UPDATE CASCADE
ON DELETE CASCADE
```

```text
ratings.group_id
→ groups.id
```

mit:

```text
ON DELETE NO ACTION
```

### Rating Constraint

Die Bewertung muss zwischen 1 und 5 liegen:

```sql
CHECK (
    rating >= 1
    AND rating <= 5
)
```

### Index

```text
idx_ratings_group_id
```

auf:

```text
group_id
```

---

# 10. `favorites`

Speichert favorisierte Rezepte.

### Spalten

| Spalte       | Typ         | NULL | Default             |
| ------------ | ----------- | ---: | ------------------- |
| `id`         | uuid        | Nein | `gen_random_uuid()` |
| `user_id`    | uuid        | Nein | —                   |
| `meal_id`    | uuid        | Nein | —                   |
| `created_at` | timestamptz | Nein | `now()`             |

### Primary Key

```text
favorites_pkey
```

auf:

```text
id
```

### Foreign Keys

```text
favorites.meal_id
→ recipes.id
```

mit:

```text
ON DELETE CASCADE
```

```text
favorites.user_id
→ profiles.id
```

mit:

```text
ON UPDATE CASCADE
ON DELETE CASCADE
```

### Unique Constraint

```text
UNIQUE (user_id, meal_id)
```

Dadurch kann ein Benutzer dasselbe Rezept nicht mehrfach favorisieren.

> **Hinweis:** Die Spalte heißt `meal_id`, verweist aber tatsächlich auf `recipes.id`. Bei Änderungen muss diese bestehende Benennung berücksichtigt werden.

---

# 11. `recipe_ratings_summary`

Dies ist eine **View**, keine Tabelle.

Definition:

```sql
SELECT
    recipe_id,
    (avg(rating))::double precision AS avg_rating,
    (count(*))::integer AS rating_count
FROM ratings
GROUP BY recipe_id;
```

### Spalten

| Spalte         | Typ              |
| -------------- | ---------------- |
| `recipe_id`    | uuid             |
| `avg_rating`   | double precision |
| `rating_count` | integer          |

Die View aggregiert alle Bewertungen eines Rezepts.

Sie berücksichtigt dabei nicht `group_id`, sondern gruppiert ausschließlich nach:

```text
recipe_id
```

---

# 12. Beziehungen

Die wichtigsten Beziehungen des aktuellen Schemas:

```text
profiles
│
├── groups.created_by
│
├── group_members.user_id
│
├── group_invitations.created_by
│
├── recipes.created_by
│
├── meal_plan.created_by
│
├── meal_plan.user_id
│
├── ratings.user_id
│
└── favorites.user_id


groups
│
├── group_members.group_id
├── group_invitations.group_id
├── recipes.group_id
├── meal_plan.group_id
└── ratings.group_id


recipes
│
├── meal_plan.recipe_id
├── ratings.recipe_id
└── favorites.meal_id
```

---

# 13. Gesamtmodell

Das aktuelle Datenmodell kann vereinfacht so betrachtet werden:

```text
                         auth.users
                             │
                             │
                             ▼
                         profiles
                        /    │    \
                       /     │     \
                      ▼      ▼      ▼
                  groups  recipes  favorites
                    │        │          │
                    │        │          │
                    ▼        │          │
              group_members │          │
                    │        │          │
                    │        ▼          │
                    │    meal_plan ◄────┘
                    │        │
                    │        │
                    ▼        ▼
             group_invitations

recipes
   │
   ├── ratings
   │      │
   │      ▼
   │  recipe_ratings_summary
   │
   └── meal_plan
```

---

# 14. Database Functions

## 14.1 `handle_new_user()`

Typ:

```text
trigger
```

Sprache:

```text
plpgsql
```

Security:

```text
SECURITY DEFINER
```

Search Path:

```text
public
```

Funktion:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, username, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email
  );

  return new;
end;
$function$
```

### Zweck

Die Function erstellt ein `profiles`-Objekt aus den Daten eines neu angelegten Auth-Users.

### Wichtiger aktueller Zustand

Die Trigger-Abfrage hat **keinen benutzerdefinierten Trigger zurückgegeben**.

Daher darf nicht angenommen werden, dass `handle_new_user()` aktuell automatisch ausgeführt wird.

---

## 14.2 `is_group_admin(target_group_id uuid)`

Rückgabewert:

```text
boolean
```

Sprache:

```text
sql
```

Security:

```text
SECURITY DEFINER
```

Funktion:

```sql
CREATE OR REPLACE FUNCTION public.is_group_admin(target_group_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group_id
    and user_id = auth.uid()
    and role = 'admin'
  );
$function$
```

### Zweck

Prüft, ob der aktuell authentifizierte Benutzer Administrator einer bestimmten Gruppe ist.

---

## 14.3 `is_group_member(target_group_id uuid)`

Rückgabewert:

```text
boolean
```

Sprache:

```text
sql
```

Security:

```text
SECURITY DEFINER
```

Funktion:

```sql
CREATE OR REPLACE FUNCTION public.is_group_member(target_group_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group_id
    and user_id = auth.uid()
  );
$function$
```

### Zweck

Prüft, ob der aktuell authentifizierte Benutzer Mitglied einer bestimmten Gruppe ist.

---

## 14.4 `update_updated_at_column()`

Typ:

```text
trigger
```

Sprache:

```text
plpgsql
```

Security Definer:

```text
false
```

Funktion:

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$
```

### Zweck

Setzt `updated_at` automatisch auf die aktuelle Zeit.

### Wichtiger aktueller Zustand

Es wurde kein zugehöriger benutzerdefinierter Trigger gefunden.

Daher ist aktuell nicht dokumentiert, dass diese Function tatsächlich automatisch ausgeführt wird.

---

# 15. Trigger

Die Abfrage der benutzerdefinierten Trigger im `public`-Schema hat **keine Ergebnisse geliefert**.

Aktueller dokumentierter Zustand:

```text
Keine benutzerdefinierten Trigger gefunden.
```

Insbesondere wurde kein Trigger gefunden, der:

* `handle_new_user()` ausführt
* `update_updated_at_column()` ausführt
* abgelaufene Gruppeneinladungen löscht
* Gruppeneinladungen deaktiviert

Wenn solche Funktionen benötigt werden, müssen sie explizit implementiert werden.

---

# 16. Row Level Security

Aktuell ist RLS auf keiner der folgenden `public`-Tabellen aktiviert:

```text
favorites
group_invitations
group_members
groups
meal_plan
profiles
ratings
recipes
```

Es wurden außerdem keine `public`-RLS-Policies zurückgegeben.

### Konsequenz

Bei Aufgaben bezüglich:

* Gruppenberechtigungen
* privaten Rezepten
* Gruppenrezepten
* Meal Plan Zugriff
* Bewertungen
* Favoriten
* Mitgliederverwaltung

muss geprüft werden, ob RLS erst implementiert werden muss.

Nicht davon ausgehen, dass die zuvor gewünschten Policies bereits existieren.

---

# 17. Storage

Es existiert ein Supabase Storage Bucket:

```text
recipe-images
```

### Eigenschaften

```text
public = true
file_size_limit = null
allowed_mime_types = null
```

Das bedeutet aktuell:

* Bucket ist öffentlich.
* Es gibt kein gespeichertes Dateigrößenlimit.
* Es gibt keine Einschränkung der MIME-Typen auf Bucket-Ebene.

---

# 18. Storage Policies

Für `storage.objects` existieren vier Policies.

Alle sind:

```text
PERMISSIVE
roles = {public}
```

## INSERT

Policy:

```text
Full Access 1rpf4wn_0
```

Bedingung:

```sql
bucket_id = 'recipe-images'
```

## UPDATE

Policy:

```text
Full Access 1rpf4wn_1
```

USING:

```sql
bucket_id = 'recipe-images'
```

## SELECT

Policy:

```text
Full Access 1rpf4wn_2
```

USING:

```sql
bucket_id = 'recipe-images'
```

## DELETE

Policy:

```text
Full Access 1rpf4wn_3
```

Bedingung:

```sql
bucket_id = 'recipe-images'
```

### Sicherheitsrelevanter Hinweis

Diese Policies verwenden:

```text
roles = {public}
```

und beschränken den Zugriff lediglich auf den Bucket `recipe-images`.

Es wurde in diesen Policies keine Benutzer- oder Gruppenmitgliedschaftsprüfung festgestellt.

Bei Änderungen am Storage-Zugriff muss dieser Zustand berücksichtigt werden.

---

# 19. Indizes

## `favorites`

```text
favorites_pkey
favorites_user_id_meal_id_key
```

## `group_invitations`

```text
group_invitations_pkey
group_invitations_code_key
```

## `group_members`

```text
group_members_pkey
group_members_group_id_user_id_key
idx_group_members_group
idx_group_members_user
```

## `groups`

```text
groups_pkey
idx_groups_created_by
```

## `meal_plan`

```text
meals_pkey
meal_plan_unique_position
idx_meal_plan_group_id
```

## `profiles`

```text
profiles_pkey
```

## `ratings`

```text
ratings_pkey
idx_ratings_group_id
```

## `recipes`

```text
recipes_pkey
idx_recipes_created_by
idx_recipes_group_id
recipes_title_lower_unique
```

---

# 20. Wichtige Constraints

## `favorites`

```text
UNIQUE (user_id, meal_id)
```

## `group_invitations`

```text
UNIQUE (code)
```

## `group_members`

```text
UNIQUE (group_id, user_id)
```

```text
role IN ('admin', 'member')
```

## `meal_plan`

```text
UNIQUE (
    group_id,
    planned_date,
    meal_type,
    position
)
```

## `ratings`

```text
rating >= 1
AND rating <= 5
```

Zusätzlich:

```text
PRIMARY KEY (recipe_id, user_id)
```

## `recipes`

```text
length(TRIM(title)) > 0
```

Zusätzlich:

```text
UNIQUE INDEX
lower(TRIM(title))
```

---

# 21. Wichtige Hinweise für Änderungen

Codex soll bei Änderungen am Projekt insbesondere folgende bestehenden Zusammenhänge berücksichtigen.

## Gruppen

Gruppen werden über:

```text
groups
group_members
group_invitations
```

modelliert.

Die Rolle eines Benutzers befindet sich in:

```text
group_members.role
```

und darf aktuell nur sein:

```text
admin
member
```

Die Funktionen:

```text
is_group_admin()
is_group_member()
```

existieren bereits und können für gruppenbezogene Berechtigungslogik verwendet werden.

---

## Rezepte

Rezepte können über `group_id` einer Gruppe zugeordnet werden.

```text
recipes.group_id → groups.id
```

`group_id` ist nullable.

Zusätzlich besitzt jedes Rezept optional einen Ersteller:

```text
recipes.created_by → profiles.id
```

---

## Meal Plan

`meal_plan` verweist auf:

* ein Rezept
* optional eine Gruppe
* optional einen Ersteller
* optional einen Benutzer

Insbesondere darf nicht angenommen werden, dass `group_id` immer gesetzt ist.

---

## Bewertungen

Bewertungen sind eindeutig pro:

```text
recipe_id + user_id
```

Die View `recipe_ratings_summary` aggregiert Bewertungen ausschließlich anhand des Rezepts.

`group_id` wird bei der Aggregation der View nicht berücksichtigt.

---

## Favoriten

Die Spalte:

```text
favorites.meal_id
```

verweist auf:

```text
recipes.id
```

und nicht auf:

```text
meal_plan.id
```

Bei Änderungen an diesem Bereich muss diese bestehende Struktur berücksichtigt werden.

---

## Gruppen-Design

Gruppen besitzen aktuell folgende Designfelder:

```text
image_url
icon
accent_color
design_variant
```

Defaults:

```text
accent_color = '#82C05C'
design_variant = 'fresh'
```

---

# 22. Aktuelle Datenbank-Landkarte

```text
                         ┌───────────────┐
                         │  auth.users   │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │   profiles    │
                         └───────┬───────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        ┌──────────┐       ┌──────────┐       ┌───────────┐
        │  groups  │       │ recipes  │       │ favorites │
        └────┬─────┘       └────┬─────┘       └───────────┘
             │                  │
       ┌─────┼──────┐           │
       │     │      │           │
       ▼     ▼      ▼           ▼
 group_  group_  meal_plan    ratings
 members invitations    │         │
       │                 │         │
       │                 └────┬────┘
       │                      │
       │                      ▼
       │             recipe_ratings_summary
       │
       └── Rollen:
           admin / member


Storage:

┌────────────────────┐
│    recipe-images   │
│      PUBLIC        │
└────────────────────┘
```

---

# 23. Regeln für Codex

Bei zukünftigen Aufgaben im KochKompass-Projekt:

1. Bestehende Tabellen und Spalten nicht umbenennen oder entfernen, ohne die Auswirkungen auf den vorhandenen Anwendungscode zu prüfen.
2. Bestehende Foreign Keys und deren `ON DELETE`-/`ON UPDATE`-Verhalten berücksichtigen.
3. Bestehende Unique- und Check-Constraints berücksichtigen.
4. Bei Gruppenfunktionen immer `groups`, `group_members` und gegebenenfalls `group_invitations` gemeinsam betrachten.
5. Die vorhandenen Functions `is_group_admin()` und `is_group_member()` berücksichtigen, bevor eine redundante Berechtigungsfunktion erstellt wird.
6. Nicht davon ausgehen, dass RLS im `public`-Schema aktiv ist.
7. Nicht davon ausgehen, dass die vorhandenen Trigger-Functions tatsächlich durch Trigger verwendet werden.
8. Nicht davon ausgehen, dass abgelaufene Einladungen automatisch gelöscht oder deaktiviert werden.
9. Bei Storage-Änderungen die bestehende öffentliche Konfiguration des Buckets `recipe-images` berücksichtigen.
10. `favorites.meal_id` verweist aktuell auf `recipes.id`.
11. `ratings` besitzt einen zusammengesetzten Primary Key aus `recipe_id` und `user_id`.
12. `recipe_ratings_summary` ist eine View und keine Tabelle.
13. Änderungen an der Datenbank sollten nach Möglichkeit über Supabase-Migrationen nachvollziehbar gemacht werden.
14. Bei Datenbankänderungen muss diese Dokumentation aktualisiert werden, wenn sich der beschriebene Datenbankzustand verändert.
15. Keine Tabellen, Spalten, Functions, Trigger, Policies oder Beziehungen erfinden, die nicht im tatsächlichen Projekt existieren.

---

# 24. Zusammenfassung des aktuellen Zustands

| Bereich                         | Aktueller Zustand              |
| ------------------------------- | ------------------------------ |
| Tabellen                        | 8                              |
| View                            | 1                              |
| `public` RLS                    | deaktiviert                    |
| `public` RLS Policies           | keine gefunden                 |
| Custom Trigger                  | keine gefunden                 |
| Functions                       | 4                              |
| Storage Buckets                 | 1                              |
| Storage Bucket                  | `recipe-images`                |
| Storage Bucket öffentlich       | ja                             |
| Storage Policies                | 4                              |
| Gruppenrollen                   | `admin`, `member`              |
| Gruppen-Einladungen             | vorhanden                      |
| Einladung Ablaufdatum           | vorhanden                      |
| Automatische Einladungslöschung | nicht vorhanden                |
| Rezept-Rating-Summary           | View                           |
| Fleischlimit                    | `groups.max_meat`, Default `3` |
| Gruppen-Icon                    | vorhanden                      |
| Gruppenfarbe                    | vorhanden                      |
| Gruppen-Designvariante          | vorhanden                      |

---

# 25. Datenbankstatus zum Zeitpunkt der Dokumentation

Diese Dokumentation basiert auf den direkt aus Supabase ausgelesenen Informationen.

Sie beschreibt den Datenbankzustand zum Zeitpunkt der Erstellung dieser Datei.

Wenn das Supabase-Schema später geändert wird, muss diese Datei entsprechend aktualisiert werden.

**Bei Konflikten zwischen dieser Dokumentation und dem tatsächlich verbundenen Supabase-Projekt gilt das tatsächliche Datenbankschema als maßgeblich.**
