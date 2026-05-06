"use client";
import { FiUpload } from "react-icons/fi";
import { useState } from "react";

const COLORS = [
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Yellow', class: 'bg-yellow-400' },
  { name: 'Lime', class: 'bg-lime-500' },
  { name: 'Green', class: 'bg-green-500' },
  { name: 'Teal', class: 'bg-teal-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Pink', class: 'bg-pink-500' },
  { name: 'White', class: 'bg-white border border-gray-300' },
  { name: 'Gray', class: 'bg-gray-500' },
  { name: 'Black', class: 'bg-black' },
  { name: 'Brown', class: 'bg-[#8B4513]' },
];

const OCCASIONS = ['formal', 'business', 'casual', 'everyday', 'vacation', 'work', 'gym', 'sports', 'party', 'swimwear', 'outerwear', 'other'];

export default function NewPostModal({ onClose }) {
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - imagePreviews.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImageFiles(prev => [...prev, ...filesToAdd]);
  };

  const toggleOccasion = (occ) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const formData = new FormData();
    formData.append("title", form["post-title"].value);
    formData.append("description", form["post-description"].value);
    formData.append("brand", form["post-brand"].value);
    formData.append("size", form["post-size"].value);
    formData.append("category", form["post-category"].value);
    formData.append("condition", form["post-condition"].value);
    formData.append("color", selectedColor);
    formData.append("occasions", JSON.stringify(selectedOccasions));
    imageFiles.forEach(file => formData.append("images", file));

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/new_post`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        onClose();
      } else {
        let message = "Failed to submit post.";
        try {
          const data = await response.json();
          message = data.message || message;
        } catch {}
        setError(message);
      }
    } catch (err) {
      console.error("Error submitting post:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-5 w-full max-w-2xl mx-4 max-h-[95vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-3">New Post</h2>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
          onClick={onClose}
        >
          &times;
        </button>
        <form className="text-gray-400 flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="post-title" className="font-medium">
              Title
            </label>
            <input
              type="text"
              id="post-title"
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter post title"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium">Upload Photos (Max 5)</span>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="post-image"
                className={`flex flex-col items-center justify-center w-full min-h-[7rem] border-2 border-gray-300 border-dashed rounded-lg p-3 ${
                  imagePreviews.length >= 5 ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none"
                }`}
              >
                <div className="flex flex-col items-center justify-center w-full h-full">
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3 justify-center mb-4">
                      {imagePreviews.map((src, idx) => (
                        <img 
                          key={idx} 
                          src={src} 
                          alt={`Preview ${idx + 1}`} 
                          className="h-16 w-16 object-cover rounded shadow-sm" 
                        />
                      ))}
                    </div>
                  )}
                  {imagePreviews.length < 5 && (
                    <>
                      <FiUpload className="w-8 h-8 mb-3 text-gray-500 shrink-0" />
                      <p className="mb-2 text-sm text-gray-500 text-center">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 text-center">
                        {5 - imagePreviews.length} remaining (SVG, PNG, JPG or GIF)
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  id="post-image"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={imagePreviews.length >= 5}
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="post-description" className="font-medium">
              Description
            </label>
            <textarea
              id="post-description"
              rows={2}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter post description"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="post-brand" className="font-medium">
                Brand
              </label>
              <input
                type="text"
                id="post-brand"
                className="border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Nike"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="post-size" className="font-medium">
                Size
              </label>
              <input
                type="text"
                id="post-size"
                className="border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Medium"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="post-category" className="font-medium">
                Category
              </label>
              <select
                id="post-category"
                className="border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select...</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="dresses">Dresses</option>
                <option value="shoes">Shoes</option>
                <option value="sweaters">Sweaters</option>
                <option value="accessories">Accessories</option>
                <option value="accessories">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="post-condition" className="font-medium">
                Condition
              </label>
              <select
                id="post-condition"
                className="border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select...</option>
                <option value="newWithTags">New With Tags</option>
                <option value="likeNew">Like New</option>
                <option value="good">Good</option>
                <option value="worn">Worn</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={`w-7 h-7 rounded-full shadow-sm hover:scale-110 transition-transform ${color.class} ${
                    selectedColor === color.name
                      ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                      : "ring-1 ring-gray-200"
                  }`}
                  onClick={() => setSelectedColor(color.name)}
                  title={color.name}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium">Occasions</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {OCCASIONS.map((occ) => (
                <label key={occ} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={selectedOccasions.includes(occ)}
                    onChange={() => toggleOccasion(occ)}
                  />
                  <span className="capitalize">
                    {occ.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <div className="mt-2 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors font-medium"
            >
              Submit Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
