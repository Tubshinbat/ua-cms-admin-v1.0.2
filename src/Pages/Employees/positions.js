import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";

// Actions
import * as actions from "../../redux/actions/employeeActions";
import { loadPositions } from "../../redux/actions/positionActions";
import axios from "../../axios-base";

// Components
import Menus from "./menu";
import { toastControl } from "../../lib/toasControl";
import Loader from "../../Components/Generals/Loader";
import base from "../../base";
import { Select, Tree } from "antd";
import { menuGenerateData } from "src/lib/menuGenerate";

const EmployeePositions = (props) => {
  // States
  const [gData, setGData] = useState([]);
  const [position, setPosition] = useState(null);
  const [positions, setPositions] = useState(null);
  const [loading, setLoading] = useState(false);

  // Functions
  const init = () => {
    props.loadEmployee();
    props.loadPositions();
    return () => {
      clear();
    };
  };
  const clear = () => {
    props.clear();
  };

  const handleOnChange = (value, event) => {
    setPosition(value);
  };

  // -- Function Drag
  const onDragEnter = (info) => {
    // setExpandedKeys(info.expandedKeys)
  };

  const onDrop = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split("-");
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children, key, callback);
        }
      }
    };
    const data = [...gData];

    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });
    if (!info.dropToGap) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else if (
      (info.node.props.children || []).length > 0 &&
      info.node.props.expanded &&
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else {
      let ar = [];
      let i;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    const sendData = {
      data: data,
    };
    props.changePosition(sendData);
    setGData(data);
  };

  // USEEFFECTS
  useEffect(() => {
    init();
    return () => {
      clear();
    };
  }, []);

  useEffect(() => {
    if (props.positions) {
      setPositions(props.positions);
      setPosition(props.positions[0]["mn"].name);
    }
  }, [props.positions]);

  // --TOAST CONTROL SUCCESS AND ERROR
  useEffect(() => {
    if (props.error) {
      toastControl("error", props.error);
      clear();
    }
  }, [props.error]);

  useEffect(() => {
    if (props.success) {
      toastControl("success", props.success);

      init();
      clear();
    }
  }, [props.success]);

  // -- LOADING
  useEffect(() => {
    setLoading(props.loading);
  }, [props.loading]);

  // -- Featch data

  useEffect(() => {
    props.loadEmployee(`positions=${position}&sort=position:descend`);
  }, [position]);

  useEffect(() => {
    const data = menuGenerateData(props.employees);
    setGData(data);
  }, [props.employees]);

  useEffect(() => {
    if (props.positions) {
      const datas = props.positions;
      const result = datas.map((data) => {
        return { value: data["mn"].name, label: data["mn"].name };
      });
      setPositions(result);
    }
  }, [props.positions]);

  return (
    <>
      <div className="content-wrapper">
        <div className="page-sub-menu">
          <Menus />
        </div>
        <div className="content mt-4 ">
          <div className="container-fluid">
            <Loader show={props.loading}> Түр хүлээнэ үү</Loader>
            <div className="row">
              <div className="col-md-12">
                <div className="datatable-header-tools">
                  <div className="datatable-actions">
                    <Select
                      onSelect={(value, event) => handleOnChange(value, event)}
                      placeholder="Алба хэлтэсийг сонгоно уу"
                      defaultValue={position}
                      options={positions}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className={`card card-custom`}>
                  <Tree
                    className="draggable-tree tree-style"
                    // defaultExpandedKeys={expandedKeys}
                    draggable
                    blockNode
                    onDragEnter={onDragEnter}
                    onDrop={onDrop}
                    treeData={gData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    success: state.employeeReducer.success,
    error: state.employeeReducer.error,
    loading: state.employeeReducer.loading,
    employees: state.employeeReducer.employees,
    positions: state.positionReducer.positions,
  };
};

const mapDispatchToProp = (dispatch) => {
  return {
    loadPositions: () => dispatch(loadPositions()),
    loadEmployee: (query) => dispatch(actions.loadEmployee(query)),
    changePosition: (data) => dispatch(actions.changePosition(data)),
    clear: () => dispatch(actions.clear()),
  };
};

export default connect(mapStateToProps, mapDispatchToProp)(EmployeePositions);
