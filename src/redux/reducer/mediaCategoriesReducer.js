const initialState = {
  categories: [],
  loading: false,
  error: null,
  success: null,
  category: null,
  type: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "CLEAR_MEDIACATEGORIES":
      return {
        ...state,
        loading: false,
        error: null,
        success: null,
        type: null,
        category: null,
      };
    case "MEDIACATEGORIES_CHANGE_POSITION_START":
      return {
        ...state,
        loading: true,
        error: null,
        success: null,
      };
    case "MEDIACATEGORIES_CHANGE_POSITION_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        success: "Өөрчлөлт хадгалагдлаа",
      };
    case "MEDIACATEGORIES_CHANGE_POSITION_ERROR":
      return {
        ...state,
        loading: false,
        error: action.error,
        success: null,
      };

    case "LOAD_MEDIA_CATEGORIES_START":
      return {
        ...state,
        loading: true,
        error: null,
        success: null,
      };

    case "LOAD_MEDIA_CATEGORIES_SUCCESS":
      return {
        ...state,
        categories: action.categories,
        loading: false,
      };

    case "LOAD_MEDIA_CATEGORIES_ERROR":
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    // Single category
    case "LOAD_MEDIA_CATEGORY_START":
      return {
        ...state,
        loading: true,
        error: null,
        category: null,
      };
    case "LOAD_MEDIA_CATEGORY_SUCCESS":
      return {
        ...state,
        category: action.category,
        loading: false,
        error: null,
      };

    case "LOAD_MEDIA_CATEGORY_ERROR":
      return {
        ...state,
        category: null,
        loading: false,
        error: action.error,
      };

    // save travel category
    case "CREATE_MEDIA_CATEGORY_START":
      return {
        ...state,
        loading: true,
        success: null,
        error: null,
      };
    case "CREATE_MEDIA_CATEGORY_SUCCESS":
      return {
        ...state,
        loading: false,
        success: "Амжилттай шинэ ангилал нэмэгдлээ",
        error: null,
      };
    case "CREATE_MEDIA_CATEGORY_ERROR":
      return {
        ...state,
        loading: false,
        success: null,
        error: action.error,
      };
    case "DELETE_MEDIA_CATEGORY_START":
      return {
        ...state,
        loading: true,
        success: null,
        error: null,
        category: null,
      };
    case "DELETE_MEDIA_CATEGORY_SUCCESS":
      return {
        ...state,
        loading: false,
        success: "Амжилттай ангилалыг устгаллаа",
        error: null,
        category: null,
      };
    case "DELETE_MEDIA_CATEGORY_ERROR":
      return {
        ...state,
        error: action.error,
        loading: false,
        success: null,
        category: null,
      };

    // Update
    case "UPDATE_MEDIA_CATEGORY_START":
      return {
        ...state,
        loading: true,
        success: null,
        error: null,
      };
    case "UPDATE_MEDIA_CATEGORY_SUCCESS":
      return {
        ...state,
        loading: false,
        success: "Амжилттай ангилалын нэр солигдлоо",
        error: null,
      };
    case "UPDATE_MEDIA_CATEGORY_ERROR":
      return {
        ...state,
        loading: false,
        error: action.error,
        success: null,
      };

    default:
      return state;
  }
};

export default reducer;
