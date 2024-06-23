const initialState = {
  loading: false,
  error: null,
  success: null,
  employees: [],
  paginationLast: {},
  excelData: [],
  employee: {},
  //count
  countLoading: false,
  totalCount: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "CLEAR_EMPLOYEE":
      return {
        ...state,
        error: null,
        success: null,
      };

    case "EMPLOYEE_CHANGE_POSITION_START":
      return {
        ...state,
        loading: true,
        error: null,
        success: null,
        employees: [],
      };

    case "EMPLOYEE_CHANGE_POSITION_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        success: null,
        employees: action.employees,
      };

    case "EMPLOYEE_CHANGE_POSITION_ERROR":
      return {
        ...state,
        loading: false,
        error: action.error,
        success: null,
        employees: [],
      };

    case "LOAD_EMPLOYEE_START":
      return {
        ...state,
        loading: true,
        error: null,
        suceess: null,
        employees: [],
      };

    case "LOAD_EMPLOYEE_SUCCESS":
      return {
        ...state,
        loading: false,
        employees: action.loadEmployee,
      };

    case "LOAD_EMPLOYEE_ERROR":
      return {
        ...state,
        loading: false,
        success: null,
        employees: [],
        error: action.error,
      };

    case "LOAD_PAGINATION":
      return {
        ...state,
        paginationLast: action.pagination,
      };
    // EXCEL
    case "GET_EMPLOYEE_EXCELDATA_START":
      return {
        ...state,
        loading: true,
        success: null,
        error: null,
        excelData: [],
      };

    case "GET_EMPLOYEE_EXCELDATA_SUCCESS":
      return {
        ...state,
        loading: false,
        excelData: action.excel,
      };

    case "GET_EMPLOYEE_EXCELDATA_ERROR":
      return {
        ...state,
        loading: false,
        success: null,
        error: action.error,
        excelData: [],
      };

    // SAVE
    case "CREATE_EMPLOYEE_INIT":
      return {
        ...state,
        loading: false,
        error: null,
        success: null,
      };

    case "CREATE_EMPLOYEE_START":
      return {
        ...state,
        loading: true,
        error: null,
        success: null,
      };

    case "CREATE_EMPLOYEE_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        employee: action.employee,
        success: "Амжилттай нэмэгдлээ",
      };
    case "CREATE_EMPLOYEE_ERROR":
      return {
        ...state,
        loading: false,
        error: action.error,
      };

    case "DELETE_MULT_EMPLOYEE_START":
      return {
        ...state,
        loading: true,
        success: null,
        error: null,
      };
    case "DELETE_MULT_EMPLOYEE_SUCCESS":
      return {
        ...state,
        loading: false,
        success: "Амжилттай устгагдлаа",
        error: null,
      };
    case "DELETE_MULT_EMPLOYEE_ERROR":
      return {
        ...state,
        loading: false,
        success: null,
        error: action.error,
      };

    //GET
    case "GET_EMPLOYEE_INIT":
      return {
        ...state,
        loading: false,
        success: null,
        error: null,
        employee: {},
      };

    case "GET_EMPLOYEE_START":
      return {
        ...state,
        loading: true,
        employee: {},
        error: null,
      };

    case "GET_EMPLOYEE_SUCCESS":
      return {
        ...state,
        loading: false,
        employee: action.singleEmployee,
        error: null,
      };

    case "GET_EMPLOYEE_ERROR":
      return {
        ...state,
        loading: false,
        employee: {},
        error: action.error,
      };
    //UPDATE
    case "UPDATE_EMPLOYEE_START":
      return {
        ...state,
        success: null,
        loading: true,
        error: null,
      };
    case "UPDATE_EMPLOYEE_SUCCESS":
      return {
        ...state,
        loading: false,
        success: "Мэдээллийг амжилттай шинэчлэгдлээ",
        error: null,
      };
    case "UPDATE_EMPLOYEE_ERROR":
      return {
        ...state,
        loading: false,
        success: null,
        error: action.error,
      };
    case "UPDATE_END":
      return {
        ...state,
        loading: false,
        success: null,
        error: null,
      };

    // GET COUNT
    case "GET_COUNT_EMPLOYEE_START":
      return {
        ...state,
        countLoading: true,
        totalCount: null,
        error: null,
      };
    case "GET_COUNT_EMPLOYEE_SUCCESS":
      return {
        ...state,
        coutLoading: false,
        totalCount: action.orderCount,
        error: null,
      };
    case "GET_COUNT_EMPLOYEE_ERROR":
      return {
        ...state,
        countLoading: false,
        totalCount: null,
        error: action.error,
      };
    default:
      return state;
  }
};

export default reducer;
