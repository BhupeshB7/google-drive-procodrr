import ImageKit from "imagekit";

const imagekit = new ImageKit({
  
    publicKey:
        process.env.IMAGEKIT_PUBLIC_KEY || "public_pCUdbevqSAGnxKNr5nlSVjKJfDw=",
    privateKey:
        process.env.IMAGEKIT_PRIVATE_KEY || "private_6TcMqBguj3SXIGvYElJoXpr8irQ=",
    urlEndpoint:
        process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/bhupeshb29",
});

export default imagekit;
