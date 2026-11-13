# Twelve Minutes Ahead — Episode 01

An original sci-fi thriller, about 11 minutes 18 seconds long, animated entirely in code: Canvas 2D for the picture and Web Audio for the sound. No image, video or audio generators are used. The engine (timeline, subtitles, compositor, exporter) comes from [cines-engine](https://github.com/mylife-as-miles/cines-engine) (*Autopilot*). The characters, sets, sound and sequences are new.

> What if you could see twelve minutes into the future, but every time you tried to save someone, somebody else died?

## Look

There are three visual worlds, taken from the reference images:

- **The control room** is a curved wall of glowing blue panels with the operator as a lone silhouette, seen from behind, and a floor that reflects the wall.
- **The city** is layered fog silhouettes in luminous blue mist, with a dark steel truss bridge and warm orange headlights and streetlamps.
- **Memories and the archive** are high-contrast black-and-white noir.

All characters are rim-lit silhouettes with real proportions and no faces, so posture carries the acting. Each colour has one meaning:

- Monitor blue is watching and CityWatch.
- Alarm red is a future death.
- Amber is time, Ada and real life.

"Future" footage is always drained green CCTV with an amber timestamp.

## Watch and render

```sh
cd films/twelve-minutes-ahead
# the player (open in a browser): film/index.html  — space to play, [ ] to jump scenes
node tools/export.js out/twelve_minutes_ahead.mp4 --workers 3   # full film, picture + synthesised soundtrack
node tools/strip.js Q05 2                                       # contact sheet of one scene
node tools/frame.js Q07 40 out/q07.png                          # one frame
node tools/look.js out/x.jpg "CR.wide(c, t, { dan: {} })"        # draw any set ad hoc
```

## Layout

| Path | What |
| --- | --- |
| `film/script.js` | The screenplay as 157 numbered lines. Every word on screen comes from here by id. |
| `film/plan.js` | `TM.plan`: lays each scene's lines out with reading-speed holds and named marks for the shots. |
| `film/rig.js` | The silhouette characters: Daniel, Ada, Mum, the driver, an officer. Side view, from behind, poses, walk and run. |
| `film/sets/common.js` | Design-space camera, glows, CCTV grade and HUD, glitch, the fog world, the truss bridge and silhouette vehicles. |
| `film/sets/control.js` | The control room: wide, close, side, profile, over-the-shoulder, the run for the door. |
| `film/sets/feeds.js` | Every camera feed: the bridge crash, King St, Harbour Rd, Mill St, the crane, the corridor, the on-ramp, the top-down junction, the map. |
| `film/sets/inserts.js` | Clock, phone, noir photograph and memory, the desk scratches, the note, the mic, the confirm key, and CityWatch's screens. |
| `film/sets/exterior.js` | City, the real bridge, the entrance, the walk home, the last pull-back, the collapse, the title. |
| `film/sound.js` | The synthesised soundtrack: hum, clock tick, score drone and pulse, heartbeat, crashes, screech, sirens, radio, the reset, Ada's piano. |
| `film/seq/Q01–Q11` | The 11 scenes, in story order. |

## Voices

This cut is fully subtitled. Each speaker has their own subtitle voice: the narrator in bone, Daniel in white, Ada in amber, CityWatch in cyan monospace, radio in italics, Future Daniel in red. To add spoken voices, record or generate one take per line id (the engine's `FILM_VOICES` hook from cines-engine). Each subtitle then holds for its take.
