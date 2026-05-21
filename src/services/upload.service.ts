import imageCompression from 'browser-image-compression';

export const uploadService = {
  uploadImg,
  uploadBodyFatImg,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function uploadImg(ev: any): Promise<any> {
  const CLOUD_NAME = 'dpsnczn5n'
  const UPLOAD_PRESET = 'MyTracker'
  const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const formData = new FormData()

  // Building the request body
  formData.append('file', ev.target.files[0])
  formData.append('upload_preset', UPLOAD_PRESET)

  // Sending a post method request to Cloudinary API
  try {
    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
    const imgData = await res.json()
    return imgData
  } catch (err) {
    console.error(err)
    throw err
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function uploadBodyFatImg(ev: any): Promise<any> {
  const CLOUD_NAME = 'dpsnczn5n'
  const UPLOAD_PRESET = 'MyTracker'
  const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  
  try {
    const compressedImage = await compressImage(ev.target.files[0])
    const formData = new FormData()
    formData.append('file', compressedImage)
    formData.append('upload_preset', UPLOAD_PRESET)
    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
    const imgData = await res.json()
    if (!res.ok) {
      throw new Error(imgData?.error?.message || 'Upload failed')
    }
    return imgData
  } catch (err) {
    console.error(err)
    throw err
  }
}

async function compressImage(image: File): Promise<File> {
  const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  }
  try {
    return image
    const compressedImage = await imageCompression(image, options)
    return compressedImage

    
  } catch (err) {
    throw err
  }
}