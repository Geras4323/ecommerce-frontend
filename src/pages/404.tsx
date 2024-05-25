import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useEffect, useState } from "react";
// import Image1 from "../../public/categories/bath.jpg";
// import Image2 from "../../public/categories/clothes.jpg";
import Image from "next/image";
import { ReactSortable } from "react-sortablejs";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { vars } from "@/utils/vars";
import type { ServerError, ServerSuccess } from "@/types/types";
import type { CloudinarySuccess } from "@/types/cloudinary";

export default function NotFound() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedPDF, setUploadedPDF] = useState<File>();

  const [tempFiles, setTempFiles] = useState<{ id: number; data: File }[]>([]);

  useEffect(() => {
    setTempFiles(
      uploadedFiles.map((file, i) => ({
        id: i,
        data: file,
      }))
    );
  }, [uploadedFiles]);

  const imagesMutation = useMutation({
    mutationFn: () => {
      const url = `${vars.serverUrl}/api/v1/images/test`;

      const images = new FormData();
      tempFiles.forEach((file) => images.append("images", file.data));

      return axios.post(url, images, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });

  const pdfMutation = useMutation<
    ServerSuccess<CloudinarySuccess>,
    ServerError
  >({
    mutationFn: () => {
      const url = `${vars.serverUrl}/api/v1/images/upload/pdf`;

      return axios.post(
        url,
        { file: uploadedPDF },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
  });

  return (
    <GeneralLayout title="404" description="Not found">
      <div className="flex h-dvh w-screen flex-col justify-center gap-8">
        <div className="flex items-center gap-6">
          <input
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) setUploadedFiles([...e.target.files]);
            }}
          />

          <div className="flex h-64 w-64 flex-col gap-2 border border-secondary/50 text-white">
            {uploadedFiles?.map((file) => (
              <span key={file.name}>{file.type}</span>
            ))}

            <button onClick={() => imagesMutation.mutate()}>send</button>
          </div>

          <ReactSortable
            animation={150}
            list={tempFiles}
            setList={setTempFiles}
            className="flex"
            direction="horizontal"
          >
            {tempFiles.map((file, i) => (
              <div key={i}>
                <Image
                  src={URL.createObjectURL(file.data)}
                  width={200}
                  height={200}
                  alt={file.data.name}
                  className="mr-4 size-48"
                />
              </div>
            ))}
          </ReactSortable>
        </div>

        <div className="flex items-center gap-6">
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files) setUploadedPDF(e.target.files[0]);
            }}
          />

          <div className="flex gap-2 border border-secondary/50 text-white">
            <button onClick={() => pdfMutation.mutate()}>send pdf</button>
          </div>

          <a href={pdfMutation.data?.data.Response.secure_url} target="_blank">
            {pdfMutation.data?.data.Response.secure_url}
          </a>
        </div>
      </div>
    </GeneralLayout>
  );
}
