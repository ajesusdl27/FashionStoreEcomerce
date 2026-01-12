import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useCallback, useEffect } from 'react';
import { s as supabase } from './supabase_CyPcJWDY.mjs';

function ImageUploader({
  initialImages = [],
  onImagesChange,
  bucket = "products",
  folder = "images",
  inputName,
  inputId
}) {
  const [images, setImages] = useState(
    initialImages.map((url) => ({ url, uploading: false }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [internalUrls, setInternalUrls] = useState(initialImages);
  const convertToWebP = async (file) => {
    if (typeof window === "undefined") return new Blob();
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not convert to WebP"));
            }
          },
          "image/webp",
          0.85
          // Quality
        );
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = URL.createObjectURL(file);
    });
  };
  const generateFileName = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${folder}/${timestamp}-${random}.webp`;
  };
  const uploadImage = async (file) => {
    const webpBlob = await convertToWebP(file);
    const fileName = generateFileName();
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, webpBlob, {
      contentType: "image/webp",
      cacheControl: "31536000"
      // 1 year cache
    });
    if (error) {
      throw new Error(error.message);
    }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };
  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    const newImages = imageFiles.map(() => ({
      url: "",
      uploading: true
    }));
    setImages((prev) => [...prev, ...newImages]);
    const startIndex = images.length;
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (!file) continue;
      try {
        const url = await uploadImage(file);
        setImages((prev) => {
          const updated = [...prev];
          if (updated[startIndex + i]) {
            updated[startIndex + i] = { url, uploading: false };
          }
          return updated;
        });
      } catch (error) {
        setImages((prev) => {
          const updated = [...prev];
          if (updated[startIndex + i]) {
            updated[startIndex + i] = { url: "", uploading: false, error: error.message };
          }
          return updated;
        });
      }
    }
  };
  const updateParent = useCallback((imgs) => {
    const urls = imgs.filter((img) => img.url && !img.uploading).map((img) => img.url);
    setInternalUrls(urls);
    if (onImagesChange) {
      onImagesChange(urls);
    }
  }, [onImagesChange]);
  useEffect(() => {
    updateParent(images);
  }, [images, updateParent]);
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };
  const moveImage = (from, to) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    setImages(newImages);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    inputName && /* @__PURE__ */ jsx(
      "input",
      {
        type: "hidden",
        name: inputName,
        id: inputId,
        value: JSON.stringify(internalUrls)
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        className: `
          border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"}
        `,
        onClick: () => document.getElementById("file-input")?.click(),
        children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              id: "file-input",
              multiple: true,
              accept: "image/*",
              className: "hidden",
              onChange: (e) => e.target.files && handleFiles(e.target.files)
            }
          ),
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: `w-12 h-12 mx-auto mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`,
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 1.5,
                  d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: isDragging ? /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "Suelta las imágenes aquí" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "Click para seleccionar" }),
            " ",
            "o arrastra imágenes aquí"
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Se convertirán automáticamente a WebP • Máx 1200px" })
        ]
      }
    ),
    images.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", children: images.map((img, index) => /* @__PURE__ */ jsx(
      "div",
      {
        className: "relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted",
        children: img.uploading ? /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" }) }) : img.error ? /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-accent/20 p-2", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-accent text-center", children: img.error }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: img.url,
              alt: `Imagen ${index + 1}`,
              className: "w-full h-full object-cover"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2", children: [
            index > 0 && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => moveImage(index, index - 1),
                className: "p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors",
                title: "Mover izquierda",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => removeImage(index),
                className: "p-2 bg-accent/80 rounded-lg hover:bg-accent transition-colors",
                title: "Eliminar",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
              }
            ),
            index < images.length - 1 && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => moveImage(index, index + 1),
                className: "p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors",
                title: "Mover derecha",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
              }
            )
          ] }),
          index === 0 && /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded font-medium", children: "Principal" })
        ] })
      },
      index
    )) })
  ] });
}

export { ImageUploader as I };
