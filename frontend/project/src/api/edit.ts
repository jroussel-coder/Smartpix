// src/api/edit.ts
export const applyEdit = async (
  editType: string,
  intensity: number,
  imageId: string,
  userId: string
): Promise<string> => {
  const form = new FormData();
  form.append("edit_type", editType);
  form.append("intensity", intensity.toString());
  form.append("image_id", imageId);
  form.append("user_id", userId);

  const res = await fetch("http://localhost:8000/api/edit", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Edit failed");
  }

  const data = await res.json();
  return data.edited_url;
};
