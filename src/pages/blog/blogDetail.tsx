import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import Header from "../../layout/header";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";

const BlogDetail: React.FC = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      const blogRef = doc(db, "blogs", blogId);
      const blogSnap = await getDoc(blogRef);
      if (blogSnap.exists()) {
        setBlog(blogSnap.data());
      } else {
        console.log("No such document!");
      }
    };
    fetchBlog();
  }, [blogId]);

  if (!blog) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <Navbar />
      <div className="hero-large-screen mt-8 px-24 mb-10">
        <>
          <h3 className=" text-4xl head ">{blog.title}</h3>
          <p className="body text-[#ffa500] mt-4">{blog.readDuration}</p>
          <p className="body text-[#ffa500] mt-4">
            Created on:{" "}
            {new Date(blog.createdAt.seconds * 1000).toLocaleDateString()}
          </p>
          <div
            className="body mt-6"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </>
      </div>
      <div className=" hero-small-screen mt-3 px-6 mb-4">
        <>
          <h3 className=" text-4xl head ">{blog.title}</h3>
          <p className="body text-[#ffa500] mt-4">{blog.readDuration}</p>
          <p className="body text-[#ffa500] mt-4">
            Created on:{" "}
            {new Date(blog.createdAt.seconds * 1000).toLocaleDateString()}
          </p>
          <div
            className="body mt-6"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetail;
