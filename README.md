# GSParser 2.0

This is a complete rewrite of the old FlyFF guild siege parser which can be found at [this link](https://gs.flyff.page).


### Requirements

- [**Wrangler**](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [**Rust**](https://www.rust-lang.org/tools/install)

### Set up

1. Run `wrangler d1 migrations apply siegelogs --local` to init db and shit.
2. Start the dev server with `wrangler dev`.

### Todo

- Endpoints

	- [ ] `GET /` - display all
	- [ ] `GET /:server` - server-specific logs
	- [ ] `GET /:server/:date` - single log
	- [ ] `POST /:server` - upload log

&nbsp;

> Powered by
> 
> <img src="https://cf-assets.www.cloudflare.com/slt3lc6tev37/CHOl0sUhrumCxOXfRotGt/081f81d52274080b2d026fdf163e3009/cloudflare-icon-color_3x.png" height="64" /> <img src="https://cf-assets.www.cloudflare.com/slt3lc6tev37/19PMkzIGit18o5epehLZOH/38706c3d470dcea777c71a98eae97054/Workers_hexagon_logo_125x113.svg" height="64" />