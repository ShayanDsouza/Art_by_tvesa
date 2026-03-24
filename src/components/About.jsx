export default function About() {
  return (
    <section id="about" className="about">
      <div className="about-content">
        <div className="about-image">
          <div className="placeholder-image">Photo</div>
        </div>
        <div className="about-text">
          <span className="section-overline">Meet the Artist</span>
          <h2>Tvesa Medh</h2>
          <p>
            Hi, I&rsquo;m Tvesa, thanks for being here! I&rsquo;m an aspiring Criminologist and
            part-time artist that works primarily with acrylic and oil paints. I also enjoy the
            occasional tattoo-style ink work, watercolour and digital messing around.
          </p>
          <p>
            Each piece here is close to my heart, and is intended to evoke a feeling you
            can&rsquo;t quite pinpoint. I hope you leave with a little more whimsy than you came
            here with, and if you&rsquo;d like to take anything with you, feel free to reach out!
          </p>
          <p>
            If you are curious about my academic work, check out my{' '}
            <a
              href="https://www.linkedin.com/in/tvesa-medh/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-inline-link"
            >
              LinkedIn
            </a>{' '}
            and/or my publication(s).
          </p>
          <a href="#gallery" className="btn btn-outline about-cta">Explore My Work</a>
        </div>
      </div>
    </section>
  )
}
