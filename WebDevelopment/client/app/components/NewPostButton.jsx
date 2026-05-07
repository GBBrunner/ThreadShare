"use client";
import { useState } from "react";
import NewPostModal from "@/app/components/NewPostModal";

export default function NewPostButton({ className }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={
          className ??
          "px-6 py-3 w-full text-lg rounded-xl font-bold bg-accent-dark text-white hover:bg-secondary transition-colors flex items-center gap-2"
        }
        onClick={() => setOpen(true)}
      >
        <img src="/add-follow-circle.svg" alt="" width={22} height={22} /> New Post
      </button>
      {open && <NewPostModal onClose={() => setOpen(false)} />}
    </>
  );
}
