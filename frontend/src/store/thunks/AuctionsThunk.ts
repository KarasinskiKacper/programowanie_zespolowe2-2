const BASE_URL = `${process.env.BASE_BACKEND_API_URL}/api`;

export const getAllAuctionsThunk = () => async (dispatch, getState) => {
  const response = await fetch(`${BASE_URL}/get_all_auctions`, {
    method: "GET",
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


export const getAuctionDetailsThunk = (auctionId) => async (dispatch, getState) => {
  const response = await fetch(`${BASE_URL}/get_auction_details?id_auction=${auctionId}`, {
    method: "GET",
  })
  const data = await response.json();
  return data;
}