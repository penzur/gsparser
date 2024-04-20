# GSParser 2.0

This is a complete rewrite of the old FlyFF guild siege parser, which can be found at [this link](https://gs.flyff.page).


### Requirements

- [**wrangler**](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [**rust**](https://www.rust-lang.org/tools/install)

### Set up

1. Run `wrangler d1 migrations apply siegelogs --local` to init db and shit.
2. Start the dev server with `wrangler dev`.


### Deploy
1. Run `wrangler deploy`

### Todo

- **Endpoints**

	- [ ] `POST /api/v1/servers` - Adds a new server (json payload should have `id(str, optional)`, `name(str)`, and `private(bool, optional)` fields)
	- [x] `POST /api/v1/logs` - Creates a new log entry (form-data should have a `file` and `server(str)` fields)
	- [x] `GET /api/v1/servers` - Gets all the servers
	- [x] `GET /api/v1/logs` - Gets all logs (can be filtered using a `server` query string i.e: `?server=<name>`)
	- [x] `GET /api/v1/logs/:server/:date` - Fetch a single log

&nbsp;

Powered by
 
<img src="https://cf-assets.www.cloudflare.com/slt3lc6tev37/CHOl0sUhrumCxOXfRotGt/081f81d52274080b2d026fdf163e3009/cloudflare-icon-color_3x.png" height="40" /> <img src="https://cf-assets.www.cloudflare.com/slt3lc6tev37/19PMkzIGit18o5epehLZOH/38706c3d470dcea777c71a98eae97054/Workers_hexagon_logo_125x113.svg" height="40" />
