import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { db } from "../../../firebase";
import { addDoc, collection, doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import BlogHead from "../../layout/blogHead";
import Footer from "../../layout/footer";

// Define toolbar options
const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "video"],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["clean"], // Remove formatting button
  ],
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "link",
  "image",
  "video",
  "align",
  "color",
  "background",
];

const CreateBlog: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [readDuration, setReadDuration] = useState(""); // New field for read duration
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        const docRef = doc(db, "blogs", id!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const blog = docSnap.data();
          setTitle(blog.title);
          setDescription(blog.description);
          setContent(blog.content);
          setReadDuration(blog.readDuration || ""); // Load read duration if available
        }
      };
      fetchBlog();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const blogData = {
      title,
      description,
      content,
      readDuration,
      createdAt: new Date(),
    };

    try {
      if (isEditing) {
        const docRef = doc(db, "blogs", id!);
        await updateDoc(docRef, blogData);
      } else {
        await addDoc(collection(db, "blogs"), blogData);
      }
      navigate("/");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div>
      <BlogHead />
      <div className="hero-large-screen">
        <div className="px-[408px] my-16 w-full">
          <h2 className=" my-4">{isEditing ? "Edit Blog" : "Create Blog"}</h2>
          <form
            className="flex flex-col text-lg gap-8 "
            onSubmit={handleSubmit}
          >
            <input
              className=" outline-none border-[#FFA500] border-[1px] bg-gray p-2"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              className=" outline-none border-[#FFA500] border-[1px] bg-gray p-2"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="text"
              className=" outline-none border-[#FFA500] border-[1px] bg-gray p-2"
              placeholder="Read Duration (e.g., 5 min read)"
              value={readDuration}
              onChange={(e) => setReadDuration(e.target.value)}
              required
            />
            <ReactQuill
              value={content}
              className=" outline-none h-48 bg-gray p-2"
              onChange={setContent}
              modules={modules}
              formats={formats}
            />
            <button className=" bg-[#FFA500] p-4 text-lg mt-6" type="submit">
              {isEditing ? "Update" : "Submit"}
            </button>
          </form>
        </div>
      </div>
      <div className="hero-small-screen">
        <div className="px-6 my-8 w-full">
          <h2 className=" my-2">{isEditing ? "Edit Blog" : "Create Blog"}</h2>
          <form
            className="flex flex-col text-lg gap-6 "
            onSubmit={handleSubmit}
          >
            <input
              className=" outline-none border-[#FFA500] border-[1px] bg-gray p-2"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              className=" outline-none border-[#FFA500] border-[1px] bg-gray p-2"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="text"
              className=" outline-none border-[#FFA500] border-[1px] bg-gray p-2"
              placeholder="Read Duration (e.g., 5 min read)"
              value={readDuration}
              onChange={(e) => setReadDuration(e.target.value)}
              required
            />
            <ReactQuill
              value={content}
              className=" outline-none  bg-gray p-2"
              onChange={setContent}
              modules={modules}
              formats={formats}
            />
            <button className=" bg-[#FFA500] p-4 text-lg mt-2" type="submit">
              {isEditing ? "Update" : "Submit"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBlog;
