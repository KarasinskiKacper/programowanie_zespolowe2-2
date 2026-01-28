import { socket } from "@/socket";

const BASE_URL = `${process.env.BASE_BACKEND_API_URL}/api`;

/**
 * Thunk that fetches all auctions from the backend
 * and returns the result as a JSON object.
 * @returns {Promise<Object>} The result of the fetch
 * call as a JSON object.
 */
export const getAllAuctionsThunk = () => async (dispatch, getState) => {
  const response = await fetch(`${BASE_URL}/get_all_auctions`, {
    method: "GET",
  });

  const data = await response.json();
  return data;
};

/**
 * Thunk that fetches all auctions owned by the current user
 * from the backend and returns the result as a JSON object.
 * @returns {Promise<Object>} The result of the fetch
 * call as a JSON object.
 */
export const getUserOwnAuctionsThunk = () => async (dispatch, getState) => {
  const accessToken = getState().auth.access_token;
  const response = await fetch(`${BASE_URL}/get_user_own_auctions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  console.log("own", data);

  return data;
};

/**
 * Thunk that fetches all auctions the current user is participating in
 * from the backend and returns the result as a JSON object.
 * @returns {Promise<Object>} The result of the fetch
 * call as a JSON object.
 */
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

/**
 * Thunk that fetches all archived auctions from the backend
 * and returns the result as a JSON object.
 * @returns {Promise<Object>} The result of the fetch
 * call as a JSON object.
 */
export const getArchiveAuctionsThunk = () => async (dispatch, getState) => {
  const accessToken = getState().auth.access_token;
  const response = await fetch(`${BASE_URL}/archived_auctions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  console.log("ar", data);

  return data;
};

/**
 * Thunk that deletes an auction by its id from the backend.
 * @param {string} auctionId - id of the auction to be deleted
 * @returns {Promise<Object>} The result of the fetch
 * call as a JSON object.
 */
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

/**
 * Thunk that fetches an image from the backend by its url
 * and returns the result as a URL string.
 * @param {string} imageUrl - url of the image to be fetched
 * @returns {Promise<string>} The result of the fetch
 * call as a URL string.
 */
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

/**
 * Thunk that uploads an image to the backend and returns
 * the result as a JSON object.
 * @param {File} file - The image file to be uploaded.
 * @returns {Promise<Object>} The result of the fetch
 * call as a JSON object.
 */
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

/**
 * Thunk that fetches an auction by its id from the backend
 * and returns the result as a JSON object.
 * @param {string} auctionId - id of the auction to be fetched
 * @returns {Promise<Object>} The result of the fetch
 * call as a JSON object.
 */
export const getAuctionDetailsThunk = (auctionId) => async (dispatch, getState) => {
  const response = await fetch(`${BASE_URL}/get_auction_details?id_auction=${auctionId}`, {
    method: "GET",
  });
  const data = await response.json();
  return data;
};

/**
 * Thunk that creates a new auction on the backend with the given data.
 * It takes an object with the following structure as an argument:
 * {
 *   title: string,
 *   description: string,
 *   startPrice: number,
 *   startDate: string,
 *   endDate: string,
 *   categories: string[],
 *   images: { is_main: boolean; url: any }[]
 * }
 * It returns the result of the fetch call as a JSON object.
 * If the response is not ok, it returns false.
 * It also emits a "join" event to the socket with the id of the created auction.
 * @param {Object} auctionData - The data of the new auction to be created.
 * @returns {Promise<Object | boolean>} The result of the fetch call as a JSON object, or false if the response is not ok.
 */
export const createNewAuctionThunk = (auctionData) => async (dispatch, getState) => {
  const images: { is_main: boolean; url: any }[] = [];

  for (const image of auctionData.images) {
    const res = await dispatch(uploadAuctionPhotoThunk(image.file));
    images.push({ is_main: false, url: res.image_url });
    console.log(res);
  }
  images[0].is_main = true;

  const accessToken = getState().auth.access_token;
  console.log("createNewAuctionThunk categories:", auctionData.categories);

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
      categories: auctionData.categories,

      photos: images,
    }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  console.log("createNewAuctionThunk", data.id_auction);

  socket.emit("join", { auction: data.id_auction });
  return data;
};

/**
 * Thunk that fetches all categories from the backend
 * and returns the result as a JSON object.
 * @returns {Promise<Object>} The result of the fetch
 * call as a JSON object.
 */
export const getAuctionCategoriesThunk = () => async (dispatch, getState) => {
  const response = await fetch(`${BASE_URL}/get_all_categories`, {
    method: "GET",
  });
  const data = await response.json();
  return data;
};

/**
 * Thunk that places a bid on an auction with the given amount.
 * It takes the id of the auction and the amount of the bid as arguments.
 * It returns true if the response is ok, and false otherwise.
 * @param {number} auctionId - The id of the auction to place a bid on.
 * @param {number} bidAmount - The amount of the bid to be placed.
 * @returns {Promise<boolean>} True if the response is ok, false otherwise.
 */
export const placeBidThunk = (auctionId, bidAmount) => async (dispatch, getState) => {
  const accessToken = getState().auth.access_token;
  const response = await fetch(`${BASE_URL}/place_bid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id_auction: auctionId, new_price: bidAmount }),
  });
  const data = await response.json();
  console.log(data);

  return response.ok;
};
