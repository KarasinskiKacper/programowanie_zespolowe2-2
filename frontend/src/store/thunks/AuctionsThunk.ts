const BASE_URL = `${process.env.BASE_BACKEND_API_URL}/api`;

export const getAllAuctionsThunk = () => async (dispatch, getState) => {
  const response = await fetch(`${BASE_URL}/get_all_auctions`, {
    method: "GET",
  });

  const data = await response.json();
  return data;
};

// export const
