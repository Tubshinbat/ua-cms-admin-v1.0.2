import axios from "../../axios-base";

const errorBuild = (error) => {
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

export const clear = () => {
  return {
    type: "CLEAR_EMPLOYEE",
  };
};

// Change Positions
export const changePosition = (data, query) => {
  return function (dispatch) {
    dispatch(changePositionStart());

    axios
      .post("employees/change", data)
      .then((responsive) => {
        const result = responsive.data.data;
        dispatch(changePositionSuccess(result));
        dispatch(loadEmployee(query));
      })
      .catch((error) => {
        const resultError = errorBuild(error);
        dispatch(changePositionError(resultError));
      });
  };
};

export const changePositionStart = (result) => {
  return {
    type: "EMPLOYEE_CHANGE_POSITION_START",
  };
};

export const changePositionSuccess = (data) => {
  return {
    type: "EMPLOYEE_CHANGE_POSITION_SUCCESS",
    employees: data,
  };
};

export const changePositionError = (error) => {
  return {
    type: "EMPLOYEE_CHANGE_POSITION_ERROR",
    error,
  };
};

// SAVE EMPLOYEE
export const saveEmployeeInit = () => {
  return {
    type: "CREATE_EMPLOYEE_INIT",
  };
};

export const saveEmployee = (employee) => {
  return function (dispatch, getState) {
    dispatch(saveEmployeeStart());
    axios
      .post(`/employees`, employee)
      .then((response) => {
        const result = response.data;
        dispatch(saveEmployeeSuccess(result));
      })
      .catch((error) => {
        const resError = errorBuild(error);
        dispatch(saveEmployeeError(resError));
      });
  };
};

export const saveEmployeeStart = () => {
  return {
    type: "CREATE_EMPLOYEE_START",
  };
};

export const saveEmployeeSuccess = (result) => {
  return {
    type: "CREATE_EMPLOYEE_SUCCESS",
    employee: result,
  };
};

export const saveEmployeeError = (error) => {
  return {
    type: "CREATE_EMPLOYEE_ERROR",
    error,
  };
};

// Excel employee
export const getExcelData = (query) => {
  return function (dispatch) {
    dispatch(getExcelDataStart());
    axios
      .get("employees/excel?" + query)
      .then((response) => {
        const data = response.data.data;
        dispatch(getExcelDataSuccess(data));
      })
      .catch((error) => {
        let resError = errorBuild(error);
        dispatch(getExcelDataError(resError));
      });
  };
};

const getExcelDataStart = () => {
  return {
    type: "GET_EMPLOYEE_EXCELDATA_START",
  };
};

const getExcelDataSuccess = (data) => {
  return {
    type: "GET_EMPLOYEE_EXCELDATA_SUCCESS",
    excel: data,
  };
};

const getExcelDataError = (error) => {
  return {
    type: "GET_EMPLOYEE_EXCELDATA_ERROR",
    error,
  };
};

// LOAD EMPLOYEE

export const loadEmployee = (query = "") => {
  return function (dispatch, getState) {
    dispatch(loadEmployeeStart());
    axios
      .get("employees?" + query)
      .then((response) => {
        const loadEmployee = response.data.data;
        const pagination = response.data.pagination;
        dispatch(loadEmployeeSuccess(loadEmployee));
        dispatch(loadPagination(pagination));
      })
      .catch((error) => {
        const resError = errorBuild(error);
        dispatch(loadEmployeeError(resError));
      });
  };
};

export const loadEmployeeStart = () => {
  return {
    type: "LOAD_EMPLOYEE_START",
  };
};

export const loadEmployeeSuccess = (loadEmployee, pagination) => {
  return {
    type: "LOAD_EMPLOYEE_SUCCESS",
    loadEmployee,
    pagination,
  };
};

export const loadEmployeeError = (error) => {
  return {
    type: "LOAD_EMPLOYEE_ERROR",
    error,
  };
};

export const loadPagination = (pagination) => {
  return {
    type: "LOAD_PAGINATION",
    pagination,
  };
};

export const deleteMultEmployee = (ids) => {
  return function (dispatch, getState) {
    dispatch(deleteMultStart());
    axios
      .delete("employees/delete", { params: { id: ids } })
      .then((response) => {
        const deleteEmployee = response.data.data;
        dispatch(deleteEmployeeSuccess(deleteEmployee));
      })
      .catch((error) => {
        const resError = errorBuild(error);
        dispatch(deleteEmployeeError(resError));
      });
  };
};

export const deleteMultStart = () => {
  return {
    type: "DELETE_MULT_EMPLOYEE_START",
  };
};

export const deleteEmployeeSuccess = (deleteData) => {
  return {
    type: "DELETE_MULT_EMPLOYEE_SUCCESS",
    deleteEmployee: deleteData,
  };
};

export const deleteEmployeeError = (error) => {
  return {
    type: "DELETE_MULT_EMPLOYEE_ERROR",
    error,
  };
};

// GET EMPLOYEE

export const getInit = () => {
  return {
    type: "GET_EMPLOYEE_INIT",
  };
};

export const getEmployee = (id) => {
  return function (dispatch, getState) {
    dispatch(getEmployeeStart());
    axios
      .get("employees/" + id)
      .then((response) => {
        const employee = response.data.data;
        dispatch(getEmployeeSuccess(employee));
      })
      .catch((error) => {
        const resError = errorBuild(error);
        dispatch(getEmployeeError(resError));
      });
  };
};

export const getEmployeeStart = () => {
  return {
    type: "GET_EMPLOYEE_START",
  };
};

export const getEmployeeSuccess = (employee) => {
  return {
    type: "GET_EMPLOYEE_SUCCESS",
    singleEmployee: employee,
  };
};

export const getEmployeeError = (error) => {
  return {
    type: "GET_EMPLOYEE_ERROR",
    error,
  };
};

//UPDATE EMPLOYEE

export const updateEmployee = (id, data) => {
  return function (dispatch) {
    dispatch(updateEmployeeStart());
    axios
      .put(`employees/${id}`, data)
      .then((response) => {
        const result = response.data;
        dispatch(updateEmployeeSuccess(result));
      })
      .catch((error) => {
        const resError = errorBuild(error);
        dispatch(updateEmployeeError(resError));
      });
  };
};

export const updateEmployeeStart = () => {
  return {
    type: "UPDATE_EMPLOYEE_START",
  };
};

export const updateEmployeeSuccess = (result) => {
  return {
    type: "UPDATE_EMPLOYEE_SUCCESS",
    updateEmployee: result,
  };
};

export const updateEmployeeError = (error) => {
  return {
    type: "UPDATE_EMPLOYEE_ERROR",
    error,
  };
};

export const getCountEmployee = () => {
  return function (dispatch) {
    dispatch(getCountEmployeeStart());

    axios
      .get(`employees/count`)
      .then((response) => {
        const result = response.data.data;
        dispatch(getCountEmployeeSuccess(result));
      })
      .catch((error) => {
        const resError = errorBuild(error);
        dispatch(getCountEmployeeError(resError));
      });
  };
};

export const getCountEmployeeStart = () => {
  return {
    type: "GET_COUNT_EMPLOYEE_START",
  };
};

export const getCountEmployeeSuccess = (result) => {
  return {
    type: "GET_COUNT_EMPLOYEE_SUCCESS",
    orderCount: result,
  };
};

export const getCountEmployeeError = (error) => {
  return {
    type: "GET_COUNT_EMPLOYEE_ERROR",
    error,
  };
};
