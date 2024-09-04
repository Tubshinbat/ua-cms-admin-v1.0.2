import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Switch, Tree } from "antd";
import { connect } from "react-redux";

// Actions
import * as actions from "../../../redux/actions/mediaCategoryActions";

// Components
import PageTitle from "../../../Components/PageTitle";
import Menus from "../menu";
import { toastControl } from "../../../lib/toasControl";
import Loader from "../../../Components/Generals/Loader";
import { useCookies } from "react-cookie";

const requiredRule = {
  required: true,
  message: "Тус талбарыг заавал бөглөнө үү",
};

const MediaCategories = (props) => {
  const [form] = Form.useForm();
  const [cookies] = useCookies(["language"]);
  // STATES
  const [gData, setGData] = useState([]);
  // const [expandedKeys] = useState(["0-0", "0-0-0", "0-0-0-0"]);
  const [loading, setLoading] = useState(false);
  const [select, setSelect] = useState([]);
  const [selectData, setSelectData] = useState(null);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState({
    edit: false,
    add: false,
    delete: false,
    parent: false,
  });

  const menuGenerateData = (categories) => {
    let datas = [];
    if (categories) {
      categories.map((el) => {
        datas.push({
          title: el[cookies.language] && el[cookies.language].name,
          key: el._id,
          children: el.children && menuGenerateData(el.children),
        });
      });
    }

    return datas;
  };

  const [isParent, setIsParent] = useState(false);

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

  useEffect(() => {
    props.loadMediaCategories();
  }, [cookies.language]);

  // FUNCTIONS
  const init = () => {
    props.clear();
    props.loadMediaCategories();
    return () => {
      clear();
    };
  };

  const clear = () => {
    props.clear();
    form.resetFields();
  };

  const onDragEnter = (info) => {
    // console.log(info);
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

  const onSelect = (selectKey, element) => {
    setSelect(selectKey);
    if (selectKey.length > 0) {
      props.getCategory(selectKey[0]);
    } else {
      setSelectData(null);
    }
  };

  // -- CRUD FUNCTIONS
  const add = (values) => {
    props.createCategory(values);
  };

  const addParent = (values) => {
    values.parentId = selectData._id;
    props.createCategory(values);
  };

  const editMenu = (values) => {
    props.updateMediaCategories(values, select[0]);
    handleCancel();
  };

  const deleteMenu = () => {
    props.deleteMediaCategory(select[0], selectData);
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

  return (
    <>
      <div className="content-wrapper">
        <PageTitle name={`Нийтлэл ангилал (${cookies.language})`} />
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
                      СОНГОГДСОН ЦЭС:{" "}
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
                    draggable
                    blockNode
                    onDragEnter={onDragEnter}
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
              <Form.Item label="Идэвхтэй эсэх" name="status">
                <Switch defaultChecked />
              </Form.Item>
            </div>

            <div className="col-12">
              <Form.Item
                label="Ангилалын нэр"
                name="name"
                rules={[requiredRule]}
              >
                <Input placeholder="Ангилалын нэрийг оруулна уу" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
      {/* Parent category */}
      <Modal
        visible={visible && visible.parent}
        title="Дэд ангилал нэмэх"
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
                  addParent(values);
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
              <Form.Item label="Идэвхтэй эсэх" name="status">
                <Switch defaultChecked />
              </Form.Item>
            </div>
            <div className="col-12">
              <Form.Item
                label="Дэд ангилалын нэр"
                name="name"
                rules={[requiredRule]}
              >
                <Input placeholder="Дэд ангилалын нэрийг оруулна уу" />
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
              <Form.Item label="Идэвхтэй эсэх" name="status">
                <Switch defaultChecked />
              </Form.Item>
            </div>
            <div className="col-12">
              <Form.Item
                label="Ангилалын нэр"
                name="name"
                rules={[requiredRule]}
              >
                <Input placeholder="Ангилалын нэрийг оруулна уу" />
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
            onClick={() => deleteMenu()}
          >
            Устгах
          </Button>,
        ]}
      >
        <p>
          Та{" "}
          <b>
            {" "}
            {selectData && selectData[cookies.language]
              ? selectData[cookies.language].name
              : "---"}
          </b>{" "}
          - ангилалыг устгахдаа итгэлтэй байна уу?{" "}
        </p>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    success: state.mediaCategoryReducer.success,
    error: state.mediaCategoryReducer.error,
    loading: state.mediaCategoryReducer.loading,
    categories: state.mediaCategoryReducer.categories,
    category: state.mediaCategoryReducer.category,
  };
};

const mapDispatchToProp = (dispatch) => {
  return {
    createCategory: (data) => dispatch(actions.saveMediaCategory(data)),
    loadMediaCategories: () => dispatch(actions.loadMediaCategories()),
    getCategory: (id) => dispatch(actions.loadMediaCategory(id)),
    changePosition: (data) => dispatch(actions.changePosition(data)),
    updateMediaCategories: (data, id) =>
      dispatch(actions.updateMediaCategory(data, id)),
    deleteMediaCategory: (id) => dispatch(actions.deleteMediaCategory(id)),
    clear: () => dispatch(actions.clear()),
  };
};

export default connect(mapStateToProps, mapDispatchToProp)(MediaCategories);
