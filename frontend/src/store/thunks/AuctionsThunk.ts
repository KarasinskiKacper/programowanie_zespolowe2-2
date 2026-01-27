const BASE_URL = `${process.env.BASE_BACKEND_API_URL}/api`;

export const getAllAuctionsThunk = () => async (dispatch, getState) => {
  const response = await fetch(`${BASE_URL}/get_all_auctions`, {
    method: "GET",
  });

  const data = await response.json();
  return data;
};

export const getUserOwnAuctionsThunk = () => async (dispatch, getState) => {
  const accessToken = getState().auth.access_token;
  const response = await fetch(`${BASE_URL}/get_user_own_auctions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data;
};

export const getUserAuctionsThunk = () => async (dispatch, getState) => {
  const accessToken = getState().auth.access_token;
  const response = await fetch(`${BASE_URL}/get_user_auctions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data;
};

export const getArchiveAuctionsThunk = () => async (dispatch, getState) => {
  const accessToken = getState().auth.access_token;
  const response = await fetch(`${BASE_URL}/archived_auctions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data;
};

// TODO not used yet
export const deleteAuctionThunk = (auctionId) => async (dispatch, getState) => {
  const accessToken = getState().auth.access_token;
  const response = await fetch(`${BASE_URL}/delete_auction`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id_auction: auctionId }),
  });

  const data = await response.json();
  return data;
};

export const getAuctionPhotoThunk = (imageUrl) => async (dispatch, getState) => {
  const response = await fetch(`${process.env.BASE_BACKEND_API_URL}/uploads/${imageUrl}`, {
    method: "GET",
  });

  if (!response.ok) {
    return "a";
  }
  const data = await response;
  return data.url;
};

const uploadAuctionPhotoThunk = (file) => async (dispatch, getState) => {
  const accessToken = getState().auth.access_token;

  const fd = new FormData();
  fd.append("image", file);

  const response = await fetch(`${BASE_URL}/upload_image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: fd,
  });

  const data = await response.json();
  return data;
};

export const getAuctionDetailsThunk = (auctionId) => async (dispatch, getState) => {
  const response = await fetch(`${BASE_URL}/get_auction_details?id_auction=${auctionId}`, {
    method: "GET",
  });
  const data = await response.json();
  return data;
};

export const createNewAuctionThunk = (auctionData) => async (dispatch, getState) => {
  const images: { is_main: boolean; url: any }[] = [];
  console.log(auctionData.images[0].file);

  for (const image of auctionData.images) {
    const res = await dispatch(uploadAuctionPhotoThunk(image.file));
    images.push({ is_main: false, url: res.image_url });
    console.log(res);
  }
  images[0].is_main = true;

  const accessToken = getState().auth.access_token;
  console.log("auctiobndata", auctionData);

  const response = await fetch(`${BASE_URL}/create_auction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      title: auctionData.title,
      description: auctionData.description,
      start_price: Number(auctionData.startPrice),
      start_date: auctionData.startDate,
      end_date: auctionData.endDate,

      photos: images,
    }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data;
};

export const getAuctionCategoriesThunk = () => async (dispatch, getState) => {
  const response = await fetch(`${BASE_URL}/get_all_categories`, {
    method: "GET",
  });
  const data = await response.json();
  return data;
};