# 3D Developer Portfolio

An immersive, interactive developer portfolio built with **Next.js 16**, **React Three Fiber**, and **Tailwind CSS v4**. Features a 3D mechanical keyboard hero scene, smooth scroll animations, and a fully responsive design.

**Built by [Sanskar](https://www.linkedin.com/in/sanskar-19b21a2ba/)**

---

## Highlights

- **Interactive 3D Keyboard** — A full mechanical keyboard rendered with React Three Fiber and Three.js. Keys react to real keypresses with physics-based animations and sound effects.
- **Seasonal Themes** — Four complete visual themes (Winter, Spring, Summer, Autumn) that re-skin the entire UI — colours, gradients, and 3D scene lighting — with a single click. (Default: Winter)
- **Project Showcases** — Modal dialogs with image carousels, tech stack chips, and links to live demos and source code.
- **Smooth Scroll & Reveal Animations** — Powered by [Lenis](https://github.com/darkroomengineering/lenis) for buttery smooth scrolling with intersection-observer-based reveal effects.
- **Custom Cursor & Magnetic Targets** — A custom cursor that morphs on interactive elements, with magnetic snap behaviour on buttons.
- **Responsive & Mobile-First** — Optimised for recruiters reviewing on phones. WebGL performance and touch interactions are first-class concerns.
- **Security Headers** — HSTS, X-Frame-Options, Content-Type-Options, Referrer-Policy, and Permissions-Policy configured out of the box.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| 3D | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei) + [Three.js](https://threejs.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Scroll | [Lenis](https://github.com/darkroomengineering/lenis) |
| Icons | [Simple Icons](https://simpleicons.org/) (tech logos on 3D keycaps) |
| Language | TypeScript |
| Deploy | Vercel / Docker |

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/Sanskarsanshu/3d-portfolio.git
cd 3d-portfolio

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Performance

- **Standalone output** — No `node_modules` in production; the Docker image is ~100 MB.
- **Lazy loading** — Project screenshots use native lazy loading.
- **Font optimisation** — Uses `next/font` for zero-layout-shift web fonts.
- **Turbopack** — Sub-300ms dev server cold starts.

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Sanskar**
- [LinkedIn](https://www.linkedin.com/in/sanskar-19b21a2ba/)
- [GitHub](https://github.com/Sanskarsanshu)
