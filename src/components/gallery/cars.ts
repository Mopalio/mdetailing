/* ═══════════════════════════════════════════════════════════════
   cars.ts: placeholder vehicles, drawn rather than photographed.

   Every car is one SVG string with two states, clean and dirty, so
   a before/after pair is the same geometry twice. When real photos
   arrive, swap carSVG() for an <img> and nothing else in the
   gallery has to change.

   Proportions are held to roughly life size: wheel diameter is
   about 0.45 of the car's height, overhangs about 0.9 m, and the
   three body types differ in roof height, cabin length and glass
   rather than only in outline.

   Ported from design/js/cars.js. The one change is the puddle under
   a clean car, which was the old aqua accent and is now neutral,
   because the palette taken from the wordmark has no hue in it.
   ═══════════════════════════════════════════════════════════ */

export type BodyType = 'coupe' | 'suv' | 'van';

export interface CarOptions {
  type?: BodyType;
  paint?: string;
  dirty?: boolean;
  seed?: number;
}

export interface FleetCar {
  id: string;
  title: string;
  sub: string;
  type: BodyType;
  paint: string;
  seed: number;
}

interface Shape {
  body: string;
  glass: string[];
  pillars: string[];
  lines: string[];
  crease: string;
  skirt: string;
  handles: number[][];
  mirror: string;
  lampF: string;
  lampR: string;
  rails: string | null;
  wheels: number[][];
  tyre: number;
  rim: number;
  arch: number;
  sill: number;
  roof: number;
  ground: number;
}

/* deterministic noise, so a given car always wears the same dirt */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── the three bodies ─────────────────────────────────────── */

const SHAPES: Record<BodyType, Shape> = {

  /* low roof, short cabin, long boot */
  coupe: {
    body:
      'M26 142 L414 142 C420 142 421 136 421 130 L421 112 C421 104 417 100 409 99 ' +
      'L286 92 C280 91 276 90 272 86 L236 58 C231 54 226 52 219 52 L160 52 ' +
      'C152 52 146 54 141 58 L108 88 L44 96 C32 98 26 104 26 114 Z',
    glass: ['M118 86 L146 62 C150 59 155 57 161 57 L218 57 C224 57 229 59 233 62 L262 85 Z'],
    pillars: ['M186 57 L186 86'],
    lines: [
      'M186 92 L186 140',
      'M421 124 L404 123 C396 122 392 128 392 134 L392 142',
      'M26 126 L44 125 C52 124 56 129 56 134 L56 142'
    ],
    crease: 'M58 118 L392 116',
    skirt:  'M70 136 L370 134',
    handles: [[200, 100, 20]],
    mirror:  'M270 84 L285 79 L288 86 L272 89 Z',
    lampF:   'M400 101 L420 105 L419 114 L398 110 Z',
    lampR:   'M27 110 L48 108 L48 118 L27 119 Z',
    rails:   null,
    wheels: [[96, 146], [344, 146]],
    tyre: 26, rim: 13.5, arch: 30,
    sill: 142, roof: 52, ground: 172
  },

  /* tall roof, long cabin, upright tailgate, big wheels */
  suv: {
    body:
      'M28 132 L412 132 C420 132 423 126 423 119 L423 101 C423 93 419 89 411 88 ' +
      'L300 81 C294 80 290 79 286 75 L258 46 C254 42 248 40 241 40 L86 40 ' +
      'C78 40 72 42 68 47 L50 76 L34 80 C26 83 22 90 22 100 L22 122 Z',
    glass: ['M60 74 L74 51 C77 47 81 45 86 45 L240 45 C246 45 251 47 254 51 L276 73 Z'],
    pillars: ['M140 45 L140 73', 'M206 45 L206 73'],
    lines: [
      'M140 80 L140 130',
      'M206 80 L206 130',
      'M423 114 L406 113 C398 112 394 118 394 124 L394 132',
      'M22 116 L38 115 C46 114 50 119 50 124 L50 132'
    ],
    crease: 'M46 108 L400 105',
    skirt:  'M64 126 L376 124',
    handles: [[152, 84, 18], [218, 84, 18]],
    mirror:  'M284 73 L299 68 L302 75 L286 78 Z',
    lampF:   'M402 90 L422 94 L421 103 L400 99 Z',
    lampR:   'M23 96 L44 94 L44 104 L23 105 Z',
    rails:   'M92 38 L236 38',
    wheels: [[96, 141], [344, 141]],
    tyre: 31, rim: 16, arch: 35,
    sill: 132, roof: 40, ground: 172
  },

  /* panel van: flat roof the whole length, glass only up front */
  van: {
    body:
      'M26 136 L414 136 C421 136 423 130 423 124 L423 108 C423 100 419 96 411 95 ' +
      'L372 90 L340 32 C337 26 331 22 323 22 L40 22 C31 22 24 29 24 38 L24 126 Z',
    glass: [
      'M352 86 L332 36 C330 31 325 29 319 29 L302 29 L302 86 Z',
      'M294 29 L294 80 L238 80 L238 29 Z'
    ],
    pillars: ['M298 30 L298 86'],
    lines: [
      'M230 29 L230 134',
      'M126 30 L126 134',
      'M423 120 L408 119 C400 118 396 124 396 130 L396 136'
    ],
    crease: 'M30 104 L404 101',
    skirt:  'M40 128 L390 126',
    handles: [[206, 86, 18]],
    mirror:  'M360 80 L377 74 L381 82 L363 86 Z',
    lampF:   'M404 97 L422 101 L421 110 L402 106 Z',
    lampR:   'M26 98 L41 97 L41 116 L26 117 Z',
    rails:   null,
    wheels: [[104, 143], [352, 143]],
    tyre: 29, rim: 15, arch: 33,
    sill: 136, roof: 22, ground: 172
  }
};

/* ── parts ────────────────────────────────────────────────── */

function wheel(cx: number, cy: number, tyre: number, rim: number, dull: boolean): string {
  const spokes: string[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    spokes.push(
      '<line x1="' + cx + '" y1="' + cy + '" ' +
      'x2="' + (cx + Math.cos(a) * (rim - 2.5)).toFixed(1) + '" ' +
      'y2="' + (cy + Math.sin(a) * (rim - 2.5)).toFixed(1) + '" ' +
      'stroke="' + (dull ? '#5c564d' : '#b6c2c9') + '" stroke-width="3.2" stroke-linecap="round"/>'
    );
  }
  return '<g>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + tyre + '" fill="#101317"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (tyre - 2.5) + '" fill="none" stroke="#1b2026" stroke-width="2"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + rim + '" fill="' + (dull ? '#766e63' : '#d3dce1') + '"/>' +
    spokes.join('') +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (rim * 0.3).toFixed(1) + '" fill="' + (dull ? '#4e4842' : '#8e9aa2') + '"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + rim + '" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="1.4"/>' +
  '</g>';
}

function strokes(list: string[] | string | null, color: string, width: number): string {
  if (!list) return '';
  const arr = Array.isArray(list) ? list : [list];
  return arr.map(function (d) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + width +
           '" stroke-linecap="round" stroke-linejoin="round"/>';
  }).join('');
}

/* road film, rain streaks and dust, heavier low down and on the
   horizontal panels, which is where it actually collects */
function grime(shape: Shape, uid: string, seed: number): string {
  const r = rng(seed);
  const out: string[] = [];
  const browns = ['#7a6c51', '#8d7d5e', '#60543f', '#9b8a68', '#4f4634'];
  const top = shape.roof, bottom = shape.sill;

  for (let i = 0; i < 24; i++) {
    const cx = 14 + r() * 414;
    const cy = top + r() * (bottom - top + 8);
    out.push(
      '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" ' +
      'rx="' + (6 + r() * 20).toFixed(1) + '" ry="' + (4 + r() * 10).toFixed(1) + '" ' +
      'fill="' + browns[(r() * browns.length) | 0] + '" opacity="' + (0.07 + r() * 0.15).toFixed(2) + '"/>'
    );
  }

  /* rain runs down the flanks and the glass */
  for (let i = 0; i < 22; i++) {
    const x = 22 + r() * 388;
    out.push(
      '<rect x="' + x.toFixed(1) + '" y="' + (top + r() * 28).toFixed(1) + '" ' +
      'width="' + (1.2 + r() * 3).toFixed(1) + '" height="' + (24 + r() * 74).toFixed(1) + '" ' +
      'rx="1.4" fill="#a08f6c" opacity="' + (0.07 + r() * 0.12).toFixed(2) + '"/>'
    );
  }

  /* road spray thrown up along the sills */
  out.push('<rect x="0" y="' + (bottom - 40) + '" width="440" height="46" fill="url(#mud-' + uid + ')"/>');

  /* dust sitting on the bonnet, roof and boot */
  out.push('<rect x="0" y="' + top + '" width="440" height="15" fill="#9b8a68" opacity=".2"/>');

  for (let i = 0; i < 120; i++) {
    out.push(
      '<circle cx="' + (8 + r() * 424).toFixed(1) + '" cy="' + (top + r() * (bottom - top + 10)).toFixed(1) + '" ' +
      'r="' + (0.5 + r() * 1.4).toFixed(2) + '" fill="#c6b48f" opacity="' + (0.12 + r() * 0.34).toFixed(2) + '"/>'
    );
  }
  return out.join('');
}

function sparkles(shape: Shape, seed: number): string {
  const r = rng(seed + 991);
  const span = shape.sill - shape.roof;
  const pts = [[0.2, 0.1], [0.42, -0.04], [0.63, 0.06], [0.82, 0.3], [0.3, 0.5], [0.7, 0.56]];
  return pts.map(function (p) {
    const x = 40 + p[0] * 360;
    const y = shape.roof + p[1] * span;
    const s = 6 + r() * 7;
    return '<g transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ')">' +
      '<path d="M0 ' + (-s) + ' L' + (s * 0.16).toFixed(1) + ' ' + (-s * 0.16).toFixed(1) +
      ' L' + s.toFixed(1) + ' 0 L' + (s * 0.16).toFixed(1) + ' ' + (s * 0.16).toFixed(1) +
      ' L0 ' + s.toFixed(1) + ' L' + (-s * 0.16).toFixed(1) + ' ' + (s * 0.16).toFixed(1) +
      ' L' + (-s).toFixed(1) + ' 0 L' + (-s * 0.16).toFixed(1) + ' ' + (-s * 0.16).toFixed(1) + ' Z" fill="#fff">' +
      '<animate attributeName="opacity" values="0;1;0" dur="' + (2 + r() * 2).toFixed(1) + 's" ' +
      'begin="' + (r() * 2.4).toFixed(1) + 's" repeatCount="indefinite"/></path></g>';
  }).join('');
}

/* ── the car ──────────────────────────────────────────────── */

/**
 * carSVG({ type, paint, dirty, seed })
 *   type  'coupe' | 'suv' | 'van'
 *   paint hex body colour
 *   dirty true → dulled paint plus a grime layer
 */
export function carSVG(opts?: CarOptions): string {
  const o = opts || {};
  const s = (o.type && SHAPES[o.type]) || SHAPES.coupe;
  const paint = o.paint || '#3c4a56';
  const dirty = !!o.dirty;
  const seed = o.seed == null ? 7 : o.seed;
  /* Derived from the car itself rather than a counter: a counter
     advances differently on the server and on the client, so the
     gradient ids would not match and hydration would complain. */
  const uid = (o.type || 'coupe') + '-' + Math.round(seed) + (dirty ? '-d' : '-c');

  const dark = 'rgba(0,0,0,.5)';
  const wheels = s.wheels.map(function (w) {
    return wheel(w[0], w[1], s.tyre, s.rim, dirty);
  }).join('');

  const arches = s.wheels.map(function (w) {
    return '<circle cx="' + w[0] + '" cy="' + w[1] + '" r="' + s.arch + '" fill="#06080b" opacity=".95"/>' +
           '<path d="M' + (w[0] - s.arch) + ' ' + s.sill + ' A' + s.arch + ' ' + s.arch +
           ' 0 0 1 ' + (w[0] + s.arch) + ' ' + s.sill + '" fill="none" stroke="rgba(0,0,0,.65)" stroke-width="2.5"/>';
  }).join('');

  const handles = s.handles.map(function (h) {
    return '<rect x="' + h[0] + '" y="' + h[1] + '" width="' + h[2] + '" height="4.6" rx="2.3" ' +
           'fill="' + (dirty ? '#6e6659' : '#c8d2d8') + '" opacity="' + (dirty ? '.6' : '.9') + '"/>';
  }).join('');

  return [
    '<svg viewBox="0 0 440 250" preserveAspectRatio="xMidYMid meet" role="img" ' +
      'aria-label="' + (dirty ? 'Vehicle before detailing' : 'Vehicle after detailing') + '">',
    '<defs>',

      '<linearGradient id="paint-' + uid + '" x1="0" y1="0" x2="0" y2="1">',
        '<stop offset="0" stop-color="' + paint + '"/>',
        '<stop offset=".3" stop-color="' + paint + '" stop-opacity="' + (dirty ? '.96' : '.84') + '"/>',
        '<stop offset=".5" stop-color="#ffffff" stop-opacity="' + (dirty ? '.025' : '.16') + '"/>',
        '<stop offset=".56" stop-color="' + paint + '"/>',
        '<stop offset="1" stop-color="#000000" stop-opacity="' + (dirty ? '.42' : '.38') + '"/>',
      '</linearGradient>',

      '<linearGradient id="gloss-' + uid + '" x1="0" y1="0" x2="1" y2="0">',
        '<stop offset="0" stop-color="#fff" stop-opacity="0"/>',
        '<stop offset=".28" stop-color="#fff" stop-opacity=".5"/>',
        '<stop offset=".5" stop-color="#fff" stop-opacity=".08"/>',
        '<stop offset=".78" stop-color="#fff" stop-opacity=".38"/>',
        '<stop offset="1" stop-color="#fff" stop-opacity="0"/>',
      '</linearGradient>',

      '<linearGradient id="glass-' + uid + '" x1="0" y1="0" x2=".35" y2="1">',
        '<stop offset="0" stop-color="' + (dirty ? '#6a6557' : '#a9dcea') + '" stop-opacity="' + (dirty ? '.95' : '.8') + '"/>',
        '<stop offset=".45" stop-color="' + (dirty ? '#454237' : '#2f6274') + '"/>',
        '<stop offset="1" stop-color="' + (dirty ? '#2c2b24' : '#14303a') + '"/>',
      '</linearGradient>',

      '<linearGradient id="mud-' + uid + '" x1="0" y1="1" x2="0" y2="0">',
        '<stop offset="0" stop-color="#4a4030" stop-opacity=".9"/>',
        '<stop offset=".5" stop-color="#6f6145" stop-opacity=".5"/>',
        '<stop offset="1" stop-color="#6f6145" stop-opacity="0"/>',
      '</linearGradient>',

      '<radialGradient id="shadow-' + uid + '" cx=".5" cy=".5" r=".5">',
        '<stop offset="0" stop-color="#000" stop-opacity=".8"/>',
        '<stop offset="1" stop-color="#000" stop-opacity="0"/>',
      '</radialGradient>',

      '<radialGradient id="pool-' + uid + '" cx=".5" cy=".5" r=".5">',
        '<stop offset="0" stop-color="#e9eef0" stop-opacity=".4"/>',
        '<stop offset="1" stop-color="#e9eef0" stop-opacity="0"/>',
      '</radialGradient>',

      '<clipPath id="clip-' + uid + '"><path d="' + s.body + '"/></clipPath>',
    '</defs>',

    '<g transform="translate(0 28)">',

      /* ground */
      '<ellipse cx="220" cy="' + (s.ground + 8) + '" rx="196" ry="14" fill="url(#shadow-' + uid + ')"/>',
      dirty ? '' : '<ellipse cx="220" cy="' + (s.ground + 10) + '" rx="156" ry="10" fill="url(#pool-' + uid + ')"/>',

      arches,

      '<g' + (dirty ? ' style="filter:saturate(.44) brightness(.86)"' : '') + '>',

        '<path d="' + s.body + '" fill="url(#paint-' + uid + ')" stroke="rgba(0,0,0,.6)" ' +
          'stroke-width="1.6" stroke-linejoin="round"/>',

        /* the long highlight a polished flank throws */
        dirty ? '' :
          '<g clip-path="url(#clip-' + uid + ')">' +
            '<rect x="0" y="' + (s.sill - 46) + '" width="440" height="13" fill="url(#gloss-' + uid + ')" opacity=".7"/>' +
          '</g>',

        /* darker rocker band */
        '<g clip-path="url(#clip-' + uid + ')">' +
          '<rect x="0" y="' + (s.sill - 9) + '" width="440" height="18" fill="#000" opacity=".3"/>' +
        '</g>',

        s.glass.map(function (g) {
          return '<path d="' + g + '" fill="url(#glass-' + uid + ')" stroke="rgba(0,0,0,.5)" ' +
                 'stroke-width="1.3" stroke-linejoin="round"/>';
        }).join(''),

        strokes(s.pillars, dark, 3),
        strokes(s.lines, 'rgba(0,0,0,.45)', 1.6),
        strokes(s.crease, 'rgba(255,255,255,' + (dirty ? '.04' : '.16') + ')', 1.6),
        strokes(s.skirt, 'rgba(0,0,0,.35)', 1.8),
        s.rails ? strokes(s.rails, dirty ? '#6f6859' : '#aab6bd', 3.4) : '',
        handles,
        '<path d="' + s.mirror + '" fill="' + paint + '" stroke="rgba(0,0,0,.5)" stroke-width="1.2"/>',
        '<path d="' + s.lampF + '" fill="' + (dirty ? '#938a74' : '#eef9fd') + '" opacity="' + (dirty ? '.7' : '1') + '"/>',
        '<path d="' + s.lampR + '" fill="' + (dirty ? '#7a4f43' : '#ff5a4d') + '" opacity="' + (dirty ? '.65' : '.95') + '"/>',
        wheels,
      '</g>',

      /* grime keeps its own colour, so it sits above the dulled paint */
      dirty
        ? '<g clip-path="url(#clip-' + uid + ')">' + grime(s, uid, seed) + '</g>' +
          s.wheels.map(function (w) {
            return '<circle cx="' + w[0] + '" cy="' + w[1] + '" r="' + s.tyre + '" fill="#6f6145" opacity=".3"/>';
          }).join('')
        : sparkles(s, seed),

    '</g>',
    '</svg>'
  ].join('');
}

/* ── the fleet shown in the gallery ───────────────────────── */

export const FLEET: FleetCar[] = [
  { id: 'a6',   title: 'Audi A6 Avant',  sub: 'Full exterior · ceramic',    type: 'coupe', paint: '#2f3942', seed: 11 },
  { id: 'golf', title: 'VW Golf GTI',    sub: 'Paint correction · 2 stage', type: 'coupe', paint: '#b2382f', seed: 23 },
  { id: 'x5',   title: 'BMW X5',         sub: 'Deep interior · leather',    type: 'suv',   paint: '#1f2a35', seed: 37 },
  { id: 'tig',  title: 'VW Tiguan',      sub: 'Winter decontamination',     type: 'suv',   paint: '#8b9299', seed: 53 },
  { id: 'tran', title: 'Ford Transit',   sub: 'Fleet wash · monthly',       type: 'van',   paint: '#dfe4e8', seed: 71 },
  { id: 'vito', title: 'Mercedes Vito',  sub: 'Full valet · engine bay',    type: 'van',   paint: '#2b3b52', seed: 89 }
];
