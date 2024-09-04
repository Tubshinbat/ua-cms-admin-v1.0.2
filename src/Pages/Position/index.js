import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Tree, message } from "antd";
import { connect } from "react-redux";

// Actions
import * as actions from "../../redux/actions/positionActions";
import axios from "../../axios-base";

// Components
import Menus from "./menu";
import { toastControl } from "../../lib/toasControl";
import Loader from "../../Components/Generals/Loader";
import base from "../../base";
import { useCookies } from "react-cookie";
import PageTitle from "src/Components/PageTitle";

const requiredRule = {
  required: true,
  message: "Тус талбарыг заавал бөглөнө үү",
};

const Position = (props) => {
  const [form] = Form.useForm();
  const [cookies] = useCookies(["language"]);
  // STATES
  const [gData, setGData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [select, setSelect] = useState([]);
  const [selectData, setSelectData] = useState(null);

  const menuGenerateData = (categories) => {
    let datas = [];
    if (categories) {
      categories.map((el) => {
        datas.push({
          title: el[cookies.language] ? (
            el[cookies.language].name
          ) : (
            <span className="red-color">
              {el[cookies.language === "eng" ? "mn" : "eng"].name}
            </span>
          ),
          key: el._id,
          children: el.children && menuGenerateData(el.children),
        });
      });
    }

    return datas;
  };

  const [visible, setVisible] = useState({
    edit: false,
    add: false,
    delete: false,
    parent: false,
  });

  // USEEFFECTS
  useEffect(() => {
    init();
    return () => {
      clear();
    };
  }, []);

  // --TOAST CONTROL SUCCESS AND ERROR
  useEffect(() => {
    if (props.error) {
      toastControl("error", props.error);
      props.clear();
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

  // -- FEATCH DATA MENUS
  useEffect(() => {
    const data = menuGenerateData(props.categories);
    setGData(data);
  }, [props.categories]);

  useEffect(() => {
    if (props.category) {
      setSelectData(props.category);
    }
  }, [props.category]);

  // FUNCTIONS
  const init = () => {
    props.loadPositions();
    return () => {
      clear();
    };
  };

  const clear = () => {
    props.clear();
    form.resetFields();
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

  const onSelect = (selectKey, element) => {
    setSelect(selectKey);
    if (selectKey.length > 0) {
      props.getPosition(selectKey[0]);
    } else {
      setSelectData(null);
    }
  };

  // -- CRUD FUNCTIONS
  const add = (values) => {
    const data = {
      ...values,
    };

    props.savePosition(data);
  };

  const editMenu = (values) => {
    const data = {
      ...values,
    };

    props.updatePosition(data, select[0]);
    handleCancel();
  };

  const deletePosition = () => {
    props.deletePosition(select[0], selectData);
    setSelect([]);
    setSelectData({});
    handleCancel();
  };

  // -- MODAL SHOW AND CLOSE
  const showModal = (modal) => {
    switch (modal) {
      case "delete": {
        if (select && select.length === 1) {
          setVisible((sb) => ({ ...sb, [modal]: true }));
        } else {
          toastControl("error", "Нэг өгөгдөл сонгоно уу");
        }
        break;
      }
      case "parent": {
        if (select && select.length === 1) {
          setVisible((sb) => ({ ...sb, [modal]: true }));
        } else {
          toastControl("error", "Нэг өгөгдөл сонгоно уу");
        }
        break;
      }
      case "edit": {
        if (select && select.length === 1) {
          form.setFieldsValue({
            ...props.category,
            name:
              props.category[cookies.language] &&
              props.category[cookies.language].name,
          });
          setVisible((sb) => ({ ...sb, [modal]: true }));
        } else {
          toastControl("error", "Нэг өгөгдөл сонгоно уу");
        }
        break;
      }
      default: {
        setVisible((sb) => ({ ...sb, [modal]: true }));

        break;
      }
    }
  };

  const handleCancel = () => {
    setVisible((sb) => Object.keys(sb).map((el) => (sb[el] = false)));
    clear();
  };

  useEffect(() => {
    props.loadPositions();
  }, [cookies.language]);

  return (
    <>
      <div className="content-wrapper">
        <PageTitle name={`Нэгж алба, тэнхим (${cookies.language})`} />
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
                    <button
                      className="datatable-action add-bg"
                      onClick={() => showModal("add")}
                    >
                      <i className="fa fa-plus"></i> Цэс нэмэх
                    </button>

                    <button
                      className={`datatable-action edit-bg ${
                        select && select.length > 0 && "active"
                      }`}
                      onClick={() => showModal("edit")}
                    >
                      <i className="fa fa-edit"></i> Засах
                    </button>
                    <button
                      className={`datatable-action delete-bg ${
                        select && select.length > 0 && "active"
                      }`}
                      onClick={() => showModal("delete")}
                    >
                      <i className="fa fa-trash"></i> Устгах
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={`card card-custom`}>
                  <div className="card-body">
                    <h3 className="card-title">
                      СОНГОГДСОН:{" "}
                      {selectData && selectData[cookies.language]
                        ? selectData[cookies.language].name
                        : "---"}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-9">
                <div className={`card card-custom`}>
                  <Tree
                    className="draggable-tree tree-style"
                    // defaultExpandedKeys={expandedKeys}
                    blockNode
                    onSelect={onSelect}
                    onDrop={onDrop}
                    treeData={gData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add category */}
      <Modal
        visible={visible && visible.add}
        title="Ангилал нэмэх"
        onCancel={() => handleCancel()}
        footer={[
          <Button key="back" onClick={() => handleCancel()}>
            Буцах
          </Button>,
          <Button
            loading={props.loading}
            key="submit"
            htmlType="submit"
            type="primary"
            onClick={() => {
              form
                .validateFields()
                .then((values) => {
                  add(values);
                })
                .catch((info) => {});
            }}
          >
            Нэмэх
          </Button>,
        ]}
      >
        <Form layout="vertical" form={form}>
          <div className="row">
            <div className="col-12">
              <Form.Item
                label="Тэнхэм, тасаг, нэгж"
                name="name"
                rules={[requiredRule]}
              >
                <Input placeholder="Тэнхэм, тасаг, нэгжийн нэрийг оруулна уу" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Edit Category */}
      <Modal
        visible={visible && visible.edit}
        title="Ангилал засах"
        onCancel={() => handleCancel()}
        footer={[
          <Button key="back" onClick={() => handleCancel()}>
            Буцах
          </Button>,
          <Button
            loading={props.loading}
            key="submit"
            htmlType="submit"
            type="primary"
            onClick={() =>
              form
                .validateFields()
                .then((values) => {
                  editMenu(values);
                })
                .catch((info) => console.log(info))
            }
          >
            Хадгалах{" "}
          </Button>,
        ]}
      >
        <Form layout="vertical" form={form}>
          <div className="row">
            <div className="col-12">
              <Form.Item
                label="Тэнхэм, тасаг, нэгж"
                name="name"
                rules={[requiredRule]}
              >
                <Input placeholder="Тэнхэм, тасаг, нэгжийн нэрийг оруулна уу" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
      <Modal
        visible={visible && visible.delete}
        title="Устгах"
        onCancel={() => handleCancel()}
        footer={[
          <Button key="back" onClick={() => handleCancel()}>
            Буцах
          </Button>,
          <Button
            loading={props.loading}
            key="submit"
            htmlType="submit"
            type="danger"
            onClick={() => deletePosition()}
          >
            Устгах
          </Button>,
        ]}
      >
        <p>
          Та{" "}
          <b>
            {selectData && selectData[cookies.language]
              ? selectData[cookies.language].name
              : "---"}{" "}
          </b>{" "}
          - устгахдаа итгэлтэй байна уу?{" "}
        </p>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    success: state.positionReducer.success,
    error: state.positionReducer.error,
    loading: state.positionReducer.loading,
    categories: state.positionReducer.positions,
    category: state.positionReducer.position,
  };
};

const mapDispatchToProp = (dispatch) => {
  return {
    savePosition: (data) => dispatch(actions.savePosition(data)),
    loadPositions: () => dispatch(actions.loadPositions()),
    getPosition: (id) => dispatch(actions.getPosition(id)),
    changePosition: (data) => dispatch(actions.changePosition(data)),
    updatePosition: (data, id) => dispatch(actions.updatePosition(data, id)),
    deletePosition: (id) => dispatch(actions.deletePosition(id)),
    clear: () => dispatch(actions.clear()),
  };
};

export default connect(mapStateToProps, mapDispatchToProp)(Position);
