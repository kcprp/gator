# gator

gator is a command-line RSS aggregator built with TypeScript, PostgreSQL, and Drizzle ORM. It lets you register users, save RSS feeds, follow feeds, fetch posts on an interval, and browse the latest entries from feeds you follow.

## Requirements

To run the CLI, you will need:

- Node.js and `npm`
- A running PostgreSQL database
- A valid PostgreSQL connection string

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

The CLI is run through the `start` script:

```bash
npm run start -- <command> [args...]
```

Example:

```bash
npm run start -- users
```

## Configuration

Gator reads its config from a file in your home directory named:

```text
~/.gatorconfig.json
```

This path comes from `src/config.ts`, which resolves the config file using your OS home directory and the filename `.gatorconfig.json`.

Create the file with the following shape:

```json
{
  "db_url": "postgres://postgres:postgres@localhost:5432/gator",
  "current_user_name": "alice"
}
```

Both fields are required by the current implementation. Even before your first `register` or `login` command, the file must already exist and contain both keys.

### Config fields

- `db_url`: PostgreSQL connection string used by the CLI and Drizzle to connect to your database
- `current_user_name`: the active user for commands that require you to be logged in

### Where to put it

Put the file directly in your home directory, not inside the project folder.

Examples:

- macOS/Linux: `/Users/your-name/.gatorconfig.json` or `/home/your-name/.gatorconfig.json`

## Database setup

Before using the CLI, make sure:

1. PostgreSQL is running.
2. The database in `db_url` already exists.
3. The required tables have been created.

This project includes Drizzle configuration in `drizzle.config.ts` and generated SQL in `src/db/out/`.

Because `drizzle.config.ts` reads `~/.gatorconfig.json`, create your config file before running migration commands.

If you are using Drizzle locally, a typical migration command is:

```bash
npx drizzle-kit migrate
```

If you prefer, you can also apply the SQL in `src/db/out/0000_cool_quasar.sql` using your normal PostgreSQL workflow.

## Quick start

Once your database and config file are ready, a common first-run flow looks like this:

```bash
# create a user and make it the current user
npm run start -- register alice

# add a feed
npm run start -- addfeed "Hacker News" https://hnrss.org/frontpage

# fetch posts every 60 seconds until you stop the process
npm run start -- agg 60000

# in another terminal, browse the latest 5 posts
npm run start -- browse 5
```

## Commands

### User commands

#### `register <name>`

Creates a new user and sets that user as the current user in `~/.gatorconfig.json`.

```bash
npm run start -- register alice
```

#### `login <name>`

Switches the current user to an existing account.

```bash
npm run start -- login alice
```

#### `users`

Lists all registered users and marks the current one.

```bash
npm run start -- users
```

#### `reset`

Deletes all users from the database.

```bash
npm run start -- reset
```

### Feed commands

#### `addfeed <feed_name> <url>`

Creates a feed and automatically follows it for the current user.

```bash
npm run start -- addfeed "Boot.dev Blog" https://blog.boot.dev/index.xml
```

#### `feeds`

Lists all feeds saved in the database, along with the user who added each one.

```bash
npm run start -- feeds
```

#### `follow <url>`

Follows an existing feed by URL.

```bash
npm run start -- follow https://hnrss.org/frontpage
```

#### `following`

Lists the feeds followed by the current user.

```bash
npm run start -- following
```

#### `unfollow <url>`

Stops following a feed by URL.

```bash
npm run start -- unfollow https://hnrss.org/frontpage
```

### Post commands

#### `agg [interval_ms]`

Starts the feed aggregator and fetches posts from followed feeds on a repeating interval.

- If no interval is provided, it defaults to `60000` milliseconds.
- The process keeps running until you stop it with `Ctrl+C`.

```bash
npm run start -- agg
npm run start -- agg 10000
```

#### `browse [limit]`

Shows the latest posts for the current user from the feeds they follow.

- If no limit is provided, it defaults to `2`.

```bash
npm run start -- browse
npm run start -- browse 5
```

## Notes

- Commands such as `addfeed`, `follow`, `following`, `unfollow`, `agg`, and `browse` require a valid `current_user_name` in your config file.
- `register` and `login` update `~/.gatorconfig.json` automatically, but the file must already exist first.
- `agg` is meant to be left running while it periodically pulls new posts from followed feeds.
- Posts are stored in PostgreSQL, so changing the database in `db_url` changes where your CLI data lives.

## Troubleshooting

### `db_url is required in config file`

Your `~/.gatorconfig.json` file is missing the `db_url` field or it is not a string.

### `current_user_name is required in config file`

Your config file is missing `current_user_name` or it is not a string.

### `User <name> not found`

The configured current user does not exist in the database yet. Run:

```bash
npm run start -- register <name>
```

or:

```bash
npm run start -- login <name>
```

## License

ISC
