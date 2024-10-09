import axios from "../../axios-base";

export const clear = () => {
  return function (dispatch, getState) {
    dispatch(clearStart);
    dispatch(loadMenus);
  };
};

const errorMessage = (error) => {
  let resError = "Алдаа гарлаа дахин оролдож үзнэ үү";

  if (resError) {
    resError = error.message;
  }

  if (error.response !== undefined && error.response.status !== undefined) {
    resError = error.response.status;
  }
  if (
    error.response !== undefined &&
    error.response.data !== undefined &&
    error.response.data.error !== undefined
  ) {
    resError = error.response.data.error.message;
  }
  return resError;
};

export const clearStart = () => {
  return {
    type: "CLEAR_MENU",
  };
};

export const loadMenus = () => {
  return function (dispatch, getState) {
    dispatch(loadMenusStart());
    axios
      .get("menu")
      .then((response) => {
        const result = response.data.data;
        dispatch(loadMenusSuccess(result));
      })
      .catch((error) => {
        const resultError = errorMessage(error);
        dispatch(loadMenusError(resultError));
      });
  };
};
export const loadMenusStart = () => {
  return {
    type: "LOAD_MENUS_START",
  };
};

export const loadMenusSuccess = (result) => {
  return {
    type: "LOAD_MENUS_SUCCESS",
    menus: result,
  };
};

export const loadMenusError = (error) => {
  return {
    type: "LOAD_MENUS_ERROR",
    error,
  };
};

// SINGLE CATEGORY

export const getMenu = (id) => {
  return function (dispatch, getState) {
    dispatch(getMenuStart());
    axios
      .get(`menu/${id}`)
      .then((response) => {
        const result = response.data.data;
        dispatch(getMenuSuccess(result));
      })
      .catch((error) => {
        const resultError = errorMessage(error);
        dispatch(getMenuError(resultError));
      });
  };
};

export const getMenuStart = () => {
  return {
    type: "GET_MENU_START",
  };
};

export const getMenuSuccess = (result) => {
  return {
    type: "GET_MENU_SUCCESS",
    menu: result,
  };
};

export const getMenuError = (error) => {
  return {
    type: "GET_MENU_ERROR",
    error,
  };
};

// Change positions
export const changePosition = (data) => {
  return function (dispatch) {
    dispatch(changePositionStart());

    axios
      .post("menu/change", data)
      .then((response) => {
        const result = response.data.data;
        dispatch(changePositionSuccess(result));
        dispatch(loadMenus());
      })
      .catch((error) => {
        const resultError = errorMessage(error);
        dispatch(changePositionError(resultError));
      });
  };
};

export const changePositionStart = (result) => {
  return {
    type: "MENUS_CHANGE_POSITION_START",
  };
};

export const changePositionSuccess = (data) => {
  return {
    type: "MENUS_CHANGE_POSITION_SUCCESS",
    menus: data,
  };
};

export const changePositionError = (error) => {
  return {
    type: "MENUS_CHANGE_POSITION_ERROR",
    error: error,
  };
};

// DELETE CATEGORY

export const deleteMenu = (menuId, data) => {
  return function (dispatch, getState) {
    dispatch(deleteMenuStart());

    axios
      .delete(`menu/${menuId}`, data)
      .then((response) => {
        const resultMenu = response.data.data;
        dispatch(deleteMenuSuccess(resultMenu));
        dispatch(loadMenus());
      })
      .catch((error) => {
        const resultError = errorMessage(error);
        dispatch(deleteMenuError(resultError));
      });
  };
};

export const deleteMenuStart = () => {
  return {
    type: "DELETE_MENU_START",
  };
};

export const deleteMenuSuccess = (result) => {
  return {
    type: "DELETE_MENU_SUCCESS",
    dlMenu: result,
  };
};

export const deleteMenuError = (error) => {
  return {
    type: "DELETE_MENU_ERROR",
    error,
  };
};

// SAVE CATEGORY

export const saveMenu = (menu) => {
  return function (dispatch, getState) {
    dispatch(saveMenuStart());
    let data = {
      name: menu.name,
      status: menu.status,
      isDirect: menu.isDirect,
      isModel: menu.isModel,
      short: menu.short,
      model: menu.model,
      direct: menu.direct,
      picture: menu.picture,
    };

    if (menu.parentId !== null) {
      data = {
        name: menu.name,
        status: menu.status,
        parentId: menu.parentId,
        isDirect: menu.isDirect,
        isModel: menu.isModel,
        model: menu.model,
        direct: menu.direct,
        picture: menu.picture,
        short: menu.short,
      };
    }

    data.language = menu.language;
    data.status = menu.status;

    axios
      .post(`menu`, data)
      .then((response) => {
        const resultMenu = response.data.data;
        dispatch(saveMenuSuccess(resultMenu));
        dispatch(loadMenus());
      })
      .catch((error) => {
        const resultError = errorMessage(error);
        dispatch(saveMenuError(resultError));
      });
  };
};

export const saveMenuStart = () => {
  return {
    type: "CREATE_MENU_START",
  };
};

export const saveMenuSuccess = (resultMenu) => {
  return {
    type: "CREATE_MENU_SUCCESS",
  };
};

export const saveMenuError = (error) => {
  return {
    type: "CREATE_MENU_ERROR",
    error: error,
  };
};

// UPDATE CATEGORY

export const updateMenu = (menu, id) => {
  return function (dispatch) {
    console.log(menu);
    console.log(id);
    dispatch(updateMenuStart());

    axios
      .put(`menu/${id}`, menu)
      .then((response) => {
        const resultMenu = response.data.data;
        dispatch(updateMenuSuccess(resultMenu));
        dispatch(loadMenus());
        dispatch(getMenu(id));
      })
      .catch((error) => {
        const resultError = errorMessage(error);
        dispatch(updateMenuError(resultError));
      });
  };
};

export const updateMenuStart = () => {
  return {
    type: "UPDATE_MENU_START",
  };
};

export const updateMenuSuccess = (resultMenu) => {
  return {
    type: "UPDATE_MENU_SUCCESS",
    resultMenu: resultMenu,
  };
};

export const updateMenuError = (error) => {
  return {
    type: "UPDATE_MENU_ERROR",
    error: error,
  };
};

export const getCountMenu = () => {
  return function (dispatch) {
    dispatch(getCountMenuStart());

    axios
      .get(`menu/count`)
      .then((response) => {
        const result = response.data.data;
        dispatch(getCountMenuSuccess(result));
      })
      .catch((error) => {
        const resError = errorMessage(error);
        dispatch(getCountMenuError(resError));
      });
  };
};

export const getCountMenuStart = () => {
  return {
    type: "GET_COUNT_MENU_START",
  };
};

export const getCountMenuSuccess = (result) => {
  return {
    type: "GET_COUNT_MENU_SUCCESS",
    orderCount: result,
  };
};

export const getCountMenuError = (error) => {
  return {
    type: "GET_COUNT_MENU_ERROR",
    error,
  };
};
