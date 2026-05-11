import branding from '@branding'

// WHY: aplica el branding del build activo al DOM en cuanto arranca la app.
// document.title se sobrescribe siempre (la pestaña del navegador necesita
// un título). Si branding.enabled === false (build white-label) no se
// inyecta nada más y el HTML queda neutro como se renderiza desde el SSR.
export function applyBranding() {
    document.title = branding.title

    if (!branding.enabled) return

    // Logo + eyebrow van dentro del .hero. El <img> se inserta antes del
    // .hero__text (queda a su izquierda) y el <span> se prepende dentro
    // de .hero__text (queda encima del <h2 id="titulo">).
    const heroInner = document.querySelector('.hero__inner')
    const heroText = document.querySelector('.hero__text')
    if (heroInner && heroText) {
        const logo = document.createElement('img')
        logo.className = 'hero__logo'
        logo.src = branding.logoSrc
        logo.alt = branding.logoAlt
        heroInner.insertBefore(logo, heroText)

        const eyebrow = document.createElement('span')
        eyebrow.className = 'hero__eyebrow'
        eyebrow.textContent = branding.eyebrow
        heroText.insertBefore(eyebrow, heroText.firstChild)
    }

    if (branding.footerText) {
        const footer = document.querySelector('.footer')
        if (footer) {
            const p = document.createElement('p')
            p.textContent = branding.footerText
            footer.appendChild(p)
        }
    }
}
