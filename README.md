# GSParser on the edge

This is a complete rewrite of the old FlyFF guild siege parser, which is hosted on Vercel with shitty Nextjs.


### Stack

- [**CloudFlare**](https://pages.cloudflare.com/) - host (requires [**wrangler**](https://developers.cloudflare.com/workers/wrangler/install-and-update/)).
- [**Rust**](https://www.rust-lang.org/tools/install) - api
- [**SolidJS**](https://www.solidjs.com/) - client side

### Set up

**API**

1. Run `wrangler d1 migrations apply siegelogs --local` to init db and shit.
2. Start the dev server with `wrangler dev`.
3. Run `wrangler deploy` to deploy API to CF.

	_TODO:_
	- [ ] `POST /api/v1/servers` - Adds a new server (json payload should have `id(str, optional)`, `name(str)`, and `private(bool, optional)` fields)
	- [x] `POST /api/v1/logs` - Creates a new log entry (form-data should have a `file` and `server(str)` fields)
	- [x] `GET /api/v1/servers` - Gets all the servers
	- [x] `GET /api/v1/logs` - Gets all logs (can be filtered using a `server` query string i.e: `?server=<name>`)
	- [x] `GET /api/v1/logs/:server/:date` - Fetch a single log
	
- **Web App**
	
	_TODO:_
    - [ ] Set up front-end with SolidJS

&nbsp;
 
<img src="https://cf-assets.www.cloudflare.com/slt3lc6tev37/CHOl0sUhrumCxOXfRotGt/081f81d52274080b2d026fdf163e3009/cloudflare-icon-color_3x.png" height="40" /> <img src="https://cf-assets.www.cloudflare.com/slt3lc6tev37/19PMkzIGit18o5epehLZOH/38706c3d470dcea777c71a98eae97054/Workers_hexagon_logo_125x113.svg" height="40" />
