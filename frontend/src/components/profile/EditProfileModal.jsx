import React, { useState, useEffect, useRef } from 'react';
import {
  Edit3,
  X,
  GraduationCap,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  User,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

// Compress & resize image to light, responsive base64 data URL
const compressImage = (dataUrl, maxWidth = 320, maxHeight = 320) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

function EditProfileModal({ isOpen, onClose, initialData, onSave }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    college: '',
    graduationDetails: '',
    location: '',
    bio: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        avatar: initialData.avatar || '',
        college: initialData.college || '',
        graduationDetails: initialData.graduationDetails || '',
        location: initialData.location || '',
        bio: initialData.bio || '',
        website: initialData.website || '',
        github: initialData.socials?.github || initialData.github || '',
        linkedin: initialData.socials?.linkedin || initialData.linkedin || '',
        twitter: initialData.socials?.x || initialData.twitter || '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const raw = event.target?.result;
      if (raw) {
        const compressed = await compressImage(raw, 320, 320);
        setFormData((prev) => ({ ...prev, avatar: compressed }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      avatar: formData.avatar,
      college: formData.college,
      graduationDetails: formData.graduationDetails,
      location: formData.location,
      bio: formData.bio,
      website: formData.website,
      github: formData.github,
      linkedin: formData.linkedin,
      twitter: formData.twitter,
      socials: {
        github: formData.github,
        linkedin: formData.linkedin,
        x: formData.twitter,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 max-w-xl w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-blue-600 mb-1">
          <Edit3 className="w-5 h-5" />
          <h3 className="text-lg font-black text-slate-900">Edit Developer Profile</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Update your public profile and personal information.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1">
          {/* Avatar / Profile Picture Upload Box */}
          <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-800 text-white flex items-center justify-center font-black text-xl shadow-xs overflow-hidden shrink-0 border-2 border-white ring-1 ring-slate-200">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(formData.name?.[0] || 'U').toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <label className="font-bold text-slate-800 block text-xs mb-1">
                Profile Avatar
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Upload Image
                </button>
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 font-bold rounded-xl border border-rose-200 text-[11px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Supports JPG, PNG, WebP or GIF (compressed automatically).
              </p>
            </div>
          </div>

          {/* Or Image Link */}
          <div>
            <label className="font-semibold text-slate-600 block mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Or Avatar URL
            </label>
            <input
              type="text"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://example.com/your-photo.jpg (or use Upload button above)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition text-[11px]"
            />
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Swastik Kori"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Jabalpur, MP, India"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Academic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                College / Institution
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g. Jabalpur Engineering College"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                Graduation / Degree
              </label>
              <input
                type="text"
                name="graduationDetails"
                value={formData.graduationDetails}
                onChange={handleChange}
                placeholder="e.g. Class of 2028 • B.Tech CSE"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">About / Bio</label>
            <textarea
              name="bio"
              rows={2}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others about your problem solving focus and interests..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed transition"
            />
          </div>

          {/* Portfolio & Socials */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs">Web &amp; Social Links</h4>

            <div>
              <label className="font-semibold text-slate-600 block mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Portfolio / Website
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="swastik.dev"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="font-semibold text-slate-600 block mb-1 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                  GitHub URL
                </label>
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1 flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-slate-700" />
                  X / Twitter URL
                </label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://x.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
