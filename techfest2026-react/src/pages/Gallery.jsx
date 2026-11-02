function Gallery() {
  const images = [
    {
      src: "https://picsum.photos/seed/techfest1/300/200",
      alt: "Students working on laptops at the TechFest coding contest"
    },
    {
      src: "https://picsum.photos/seed/techfest2/300/200",
      alt: "Robots lined up for the TechFest robotics challenge"
    },
    {
      src: "https://picsum.photos/seed/techfest3/300/200",
      alt: "Audience at the TechFest cultural night"
    }
  ];

  return (
    <div className="page">
      <h1>Gallery</h1>

      <div className="gallery-grid">
        {images.map((image) => (
          // loading="lazy": image downloads only when scrolled near.
          // width/height: browser reserves space, so the page does not jump.
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            width="300"
            height="200"
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}

export default Gallery;
