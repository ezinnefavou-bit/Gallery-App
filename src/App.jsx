import { useRef, useState } from "react";
import { uploadImage, getTransformedUrl, MAX_FILE_SIZE_MB } from "./cloudinary";

const icons = {
  home: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />,
};

const navButtonStyle =
  "grid cursor-pointer place-items-center rounded-full bg-transparent text-[#1f1f23] focus-visible:outline-2 focus-visible:outline-emerald-600";
const navButtonSmall = "h-11 w-11 sm:h-13 sm:w-13";
const navButtonActive =
  "h-11 w-15 bg-[rgba(184,217,201,0.75)] text-[#278654] sm:h-13 sm:w-19";

function Icon({ name, size = 26, filled = false }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

function FavouriteButton({ image, onToggle }) {
  const label = image.isFavourite
    ? `Remove ${image.name} from favourites`
    : `Add ${image.name} to favourites`;
  const colour = image.isFavourite ? "text-[#e5484d]" : "text-[#1f1f23]";

  return (
    <button
      type="button"
      className={`absolute right-2 bottom-2 grid size-8 cursor-pointer place-items-center rounded-full bg-white/90 shadow-[0_2px_6px_rgba(0,0,0,0.2)] focus-visible:outline-2 focus-visible:outline-emerald-600 ${colour}`}
      onClick={() => onToggle(image.id)}
      aria-label={label}
      aria-pressed={image.isFavourite}
    >
      <Icon name="heart" size={18} filled={image.isFavourite} />
    </button>
  );
}

function GalleryTile({ image, onToggleFavourite }) {
  return (
    <li className="relative">
      <a href={image.url} target="_blank" rel="noreferrer" className="group">
        <img
          src={getTransformedUrl(image.url)}
          alt={image.name}
          loading="lazy"
          className="block aspect-4/3 w-full rounded-xs object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </a>
      <FavouriteButton image={image} onToggle={onToggleFavourite} />
    </li>
  );
}

export default function App() {
  const fileInputRef = useRef(null);
  const [page, setPage] = useState("home");
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const latestImage = images[0];
  const favouriteImages = images.filter((image) => image.isFavourite);

  function goToPage(pageName) {
    setPage(pageName);
    window.scrollTo(0, 0);
  }

  function openMyImages() {
    setPage("upload");
    setTimeout(() => {
      document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function toggleFavourite(imageId) {
    setImages((previous) =>
      previous.map((image) =>
        image.id === imageId ? { ...image, isFavourite: !image.isFavourite } : image
      )
    );
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, GIF, WebP...).");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`That image is larger than ${MAX_FILE_SIZE_MB}MB. Please choose a smaller one.`);
      setSelectedFile(null);
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select an image before uploading.");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const uploaded = await uploadImage(selectedFile);
      setImages((previous) => [{ ...uploaded, isFavourite: false }, ...previous]);
      setSuccess("Image uploaded successfully.");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-8 pb-30">
      {page === "home" && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_rgba(7,93,67,0.25)]">
          <nav className="flex min-h-16 flex-wrap items-stretch justify-between bg-[#278654] text-white sm:flex-nowrap" aria-label="Home">
            <div className="flex basis-3/5 flex-col justify-center px-4 py-3 text-lg leading-tight sm:basis-auto sm:px-7">
              Photos
              <span className="text-right text-xs tracking-widest">GALLERY</span>
            </div>
            <div className="order-3 flex basis-full items-center justify-around pt-1 pb-2 sm:order-none sm:basis-auto sm:justify-start sm:gap-12 sm:py-0">
              <button
                type="button"
                onClick={openMyImages}
                className="cursor-pointer bg-transparent py-2 text-[13px] tracking-[0.08em] text-white uppercase hover:underline focus-visible:outline-2 focus-visible:outline-white"
              >
                My Images
              </button>
              <button
                type="button"
                onClick={() => goToPage("favourites")}
                className="cursor-pointer bg-transparent py-2 text-[13px] tracking-[0.08em] text-white uppercase hover:underline focus-visible:outline-2 focus-visible:outline-white"
              >
                Favourites
              </button>
            </div>
            <button
              type="button"
              onClick={() => goToPage("upload")}
              className="cursor-pointer bg-[#ece8b0] px-4 text-[13px] font-semibold tracking-[0.08em] text-[#1f6b45] uppercase hover:bg-[#f3efc4] focus-visible:-outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#278654] sm:px-8"
            >
              Upload Image
            </button>
          </nav>

          <section className="flex min-h-[400px] flex-col items-center justify-center bg-[linear-gradient(160deg,#0b6b4d_0%,#075d43_50%,#054733_100%)] px-6 py-12 text-center text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.3)] sm:min-h-[480px]">
            <h1 className="max-w-[14em] text-[clamp(32px,6vw,56px)] leading-tight font-normal tracking-[0.04em]">
              Your Photos, All in One Gallery
            </h1>
            <p className="mt-6 max-w-[30em] text-[clamp(16px,2.4vw,22px)] leading-normal tracking-[0.05em]">
              Upload your images, see them appear in your gallery, and save the ones you love to your favourites.
            </p>
            <button
              type="button"
              onClick={() => goToPage("upload")}
              className="mt-8 cursor-pointer rounded-sm border-b-[3px] border-[#278654] bg-[#ece8b0] px-5.5 py-2.5 text-[13px] font-semibold tracking-[0.08em] text-[#1f6b45] uppercase [text-shadow:none] hover:bg-[#f3efc4] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
            >
              Get Started
            </button>
          </section>

          <div className="pattern-band h-24" aria-hidden="true" />
        </div>
      )}

      {page !== "home" && (
        <div className="grid min-h-[560px] grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_rgba(7,93,67,0.25)] md:grid-cols-[220px_1fr]">
          <aside className="hidden bg-linear-to-b from-[#dcefe5] to-[#bfdccb] px-5 py-7 text-[13px] md:block">
            <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-[#222] font-semibold text-white" aria-hidden="true">G</div>
            <p className="mb-7 text-center font-semibold">Gallery</p>
            <p className="mt-4.5 mb-2 font-semibold">Library</p>
            <p className={page === "upload" ? "border-l-[3px] border-[#278654] bg-white/40 px-2 py-1.5 text-[#444]" : "px-2 py-1.5 text-[#444]"}>Photos</p>
            <p className="mt-4.5 mb-2 font-semibold">Storage</p>
            <p className="px-2 py-1.5 text-[#444]">Cloudinary</p>
          </aside>

          <main className="min-w-0 px-4 py-5 md:px-7 md:pt-7 md:pb-8">
            {page === "upload" && (
              <>
                <h1 className="text-[26px] font-semibold">Photos</h1>
                <p className="mt-3.5 mb-4.5 text-sm font-semibold">
                  {images.length} {images.length === 1 ? "image" : "images"} uploaded this session
                </p>

                <form className="flex flex-wrap items-center gap-2.5" onSubmit={handleSubmit}>
                  <input
                    id="image-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="image-input"
                    className="flex min-w-[220px] flex-1 cursor-pointer items-center gap-2.5 rounded-md border border-[#b8d9c9] p-1.5 text-[13px] peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-600"
                  >
                    <span className="rounded-sm bg-[#e3f2ea] px-3 py-1.5 font-semibold whitespace-nowrap">Choose image</span>
                    <span className="truncate text-[#666]">
                      {selectedFile
                        ? `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`
                        : "No file selected"}
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="cursor-pointer rounded-md bg-linear-to-br from-[#2f9a63] to-[#278654] px-6.5 py-2.75 text-sm font-semibold text-white hover:not-disabled:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                </form>

                <div aria-live="polite">
                  {isUploading && (
                    <p className="mt-3 flex items-center gap-2 rounded-md bg-[#e3f2ea] px-3 py-2.5 text-[13px] text-[#1f6b45]">
                      <span className="size-3.5 animate-spin rounded-full border-2 border-[#278654] border-t-transparent" /> Uploading your image to Cloudinary...
                    </p>
                  )}
                  {error && (
                    <p className="mt-3 flex items-center gap-2 rounded-md bg-[#fdecec] px-3 py-2.5 text-[13px] text-[#b42318]" role="alert">{error}</p>
                  )}
                  {success && (
                    <p className="mt-3 flex items-center gap-2 rounded-md bg-[#e8f6ee] px-3 py-2.5 text-[13px] text-[#1a7f45]">{success}</p>
                  )}
                </div>

                {latestImage && (
                  <figure className="mt-5">
                    <div className="relative">
                      <img
                        src={latestImage.url}
                        alt={`Latest upload: ${latestImage.name}`}
                        className="block max-h-[340px] w-full rounded-sm bg-[#f4f4f6] object-contain"
                      />
                      <FavouriteButton image={latestImage} onToggle={toggleFavourite} />
                    </div>
                    <figcaption className="mt-1.5 text-xs text-[#666]">Latest upload</figcaption>
                  </figure>
                )}

                <div id="gallery">
                  {images.length === 0 ? (
                    <p className="mt-6 rounded-md border-2 border-dashed border-[#b8d9c9] px-4 py-10 text-center text-sm text-[#777]">
                      Your gallery is empty. Choose an image and press Upload to add your first photo.
                    </p>
                  ) : (
                    <ul className="mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
                      {images.map((image) => (
                        <GalleryTile key={image.id} image={image} onToggleFavourite={toggleFavourite} />
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {page === "favourites" && (
              <>
                <h1 className="text-[26px] font-semibold">Favourites</h1>
                <p className="mt-3.5 mb-4.5 text-sm font-semibold">
                  {favouriteImages.length} {favouriteImages.length === 1 ? "favourite image" : "favourite images"}
                </p>

                {favouriteImages.length === 0 ? (
                  <p className="mt-6 rounded-md border-2 border-dashed border-[#b8d9c9] px-4 py-10 text-center text-sm text-[#777]">
                    No favourites yet. Tap the heart on any uploaded image to save it here.
                  </p>
                ) : (
                  <ul className="mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
                    {favouriteImages.map((image) => (
                      <GalleryTile key={image.id} image={image} onToggleFavourite={toggleFavourite} />
                    ))}
                  </ul>
                )}
              </>
            )}
          </main>
        </div>
      )}

      <nav className="fixed bottom-5 left-1/2 flex w-max max-w-[calc(100%-24px)] -translate-x-1/2 items-center" aria-label="Main">
        <div className="flex gap-1.5 rounded-full border border-white/70 bg-[rgba(240,250,244,0.6)] p-1.5 shadow-[0_8px_24px_rgba(7,93,67,0.18)] backdrop-blur-[18px]">
          <button
            type="button"
            className={`${navButtonStyle} ${page === "home" ? navButtonActive : navButtonSmall}`}
            aria-label="Home"
            aria-current={page === "home" ? "page" : undefined}
            onClick={() => goToPage("home")}
          >
            <Icon name="home" />
          </button>
          <button
            type="button"
            className={`${navButtonStyle} ${page === "favourites" ? navButtonActive : navButtonSmall}`}
            aria-label="Favourites"
            aria-current={page === "favourites" ? "page" : undefined}
            onClick={() => goToPage("favourites")}
          >
            <Icon name="heart" />
          </button>
        </div>
      </nav>
    </div>
  );
}
