import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BlogHead from "../../layout/blogHead";
import Footer from "../../layout/footer";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase.ts";

interface Blog {
  id: string;
  title: string;
  createdAt: {
    seconds: number;
  };
  readDuration: string;
  description: string;
}

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;

  useEffect(() => {
    const fetchBlogs = async () => {
      const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const blogsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Blog[];
      setBlogs(blogsData);
    };
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "blogs", id));
    setBlogs(blogs.filter((blog) => blog.id !== id));
  };

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <BlogHead />
      <div className="hero-large-screen px-24">
        <h2>Blog List</h2>
        <ul>
          {currentBlogs.map((blog) => (
            <li key={blog.id}>
              <div className="bg-slate-100 my-4 p-6">
                <div>
                  <h5 className="text-4xl text-black mb-2 head capitalize">
                    {blog.title}
                  </h5>
                </div>
                <div className="flex justify-between mb-2 body">
                  <p className="text-[#ffa500]">
                    {new Date(
                      blog.createdAt.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-[#ffa500]">{blog.readDuration}</p>
                </div>
                <div className="body text-black">{blog.description}</div>
                <div className="flex justify-between">
                  <Link to={`/blogDetail/${blog.id}`}>Read More</Link>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(blog.id)}>
                      Delete
                    </button>
                    <Link to={`/edit-blog/${blog.id}`}>Edit</Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <nav>
          <ul className="flex gap-3 text-center justify-center text-lg font-medium text-[#FFA500]">
            {Array.from(
              { length: Math.ceil(blogs.length / blogsPerPage) },
              (_, i) => (
                <li key={i}>
                  <button onClick={() => paginate(i + 1)}>{i + 1}</button>
                </li>
              )
            )}{" "}
            ...
          </ul>
        </nav>
      </div>
      <div className="hero-small-screen px-8">
        <h2>Blog List</h2>
        <ul>
          {currentBlogs.map((blog) => (
            <li key={blog.id}>
              <div className="bg-slate-100 my-2 p-2">
                <div>
                  <h5 className="text-4xl text-black mb-2 head capitalize">
                    {blog.title}
                  </h5>
                </div>
                <div className="flex justify-between mb-2 body">
                  <p className="text-[#ffa500]">
                    {new Date(
                      blog.createdAt.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-[#ffa500]">{blog.readDuration}</p>
                </div>
                <div className="body text-black">{blog.description}</div>
                <div className="flex justify-between">
                  <Link to={`/blogDetail/${blog.id}`}>Read More</Link>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(blog.id)}>
                      Delete
                    </button>
                    <Link to={`/edit-blog/${blog.id}`}>Edit</Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <nav>
          <ul className="flex gap-3 text-center justify-center text-lg font-medium text-[#FFA500]">
            {Array.from(
              { length: Math.ceil(blogs.length / blogsPerPage) },
              (_, i) => (
                <li key={i}>
                  <button onClick={() => paginate(i + 1)}>{i + 1}</button>
                </li>
              )
            )}{" "}
            ...
          </ul>
        </nav>
      </div>
      <Footer />
    </div>
  );
};

export default BlogList;
