import React, { useEffect, useState } from "react";
import { Form, Input, Button, Tree, Modal } from "antd";
import { connect } from "react-redux";

//Components
import Loader from "../../../Components/Generals/Loader";
import Menus from "../menu";

//Actions
import { tinymceAddPhoto } from "../../../redux/actions/imageActions";
import * as actions from "../../../redux/actions/socialLinkActions";

// Lib
import base from "../../../base";
import axios from "../../../axios-base";
import { toastControl } from "src/lib/toasControl";
import { convertFromdata } from "../../../lib/handleFunction";

const requiredRule = {
  required: true,
  message: "Тус талбарыг заавал бөглөнө үү",
};

const WebSettings = (props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState({
    visible: false,
    message: "",
  });
  const [visible, setVisible] = useState({
    edit: false,
    add: false,
    delete: false,
    parent: false,
  });

  // Tree
  const [treeData, setTreeData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const onSelect = (selectedKeysValue, info) => {
    console.log("onSelect", info);
    setSelectedKeys(selectedKeysValue);
    props.getLink(selectedKeysValue);
  };

  // FUNCTIONS
  const init = () => {
    props.loadLinks();
  };

  const clear = () => {
    form.resetFields();
    setLoading(false);
    handleCancel();
  };

  const handleAdd = (values, status = null) => {
    const data = {
      ...values,
    };
    const sendData = convertFromdata(data);
    props.createLink(sendData);
  };

  const handelEdit = (values) => {
    const sendData = convertFromdata(values);
    props.updateLink(selectedKeys, sendData);
  };

  const handleDelete = () => {
    props.deleteLink(selectedKeys);
  };

  // -- MODAL SHOW AND CLOSE
  const showModal = (modal) => {
    switch (modal) {
      case "delete": {
        if (selectedKeys && selectedKeys.length === 1) {
          setVisible((sb) => ({ ...sb, [modal]: true }));
        } else {
          toastControl("error", "Нэг өгөгдөл сонгоно уу");
        }
        break;
      }
      case "edit": {
        if (selectedKeys && selectedKeys.length === 1) {
          form.setFieldsValue(props.link);
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
    form.resetFields();
    setSelectedKeys([]);
    setVisible((sb) => Object.keys(sb).map((el) => (sb[el] = false)));
  };

  // USEEFFECT
  useEffect(() => {
    init();
    return () => clear();
  }, []);

  // Ямар нэгэн алдаа эсвэл амжилттай үйлдэл хийгдвэл энд useEffect барьж аваад TOAST харуулна
  useEffect(() => {
    toastControl("error", props.error);
  }, [props.error]);

  useEffect(() => {
    if (props.success) {
      toastControl("success", props.success);
      clear();
    }
  }, [props.success]);

  useEffect(() => {
    if (props.links && props.links.length > 0) {
      console.log(props.links);
      setTreeData(
        props.links.map((link) => ({
          key: link._id,
          title: link.name,
        }))
      );
    }
  }, [props.links]);

  return (
    <>
      <div className="content-wrapper">
        <div className="page-sub-menu">
          <Menus />
        </div>
        <div className="content">
          <Loader show={loading.visible}> {loading.message} </Loader>
          <div className="container-fluid">
            <Form layout="vertical" form={form}>
              <div className="row">
                <div className="col-12">
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div class="card-header">
                          <h3 class="card-title">Сошиал сувгууд</h3>
                        </div>

                        <div className="card-body datatable-card-body">
                          <div className="datatable-header-tools">
                            <div className="datatable-actions">
                              <button
                                className="datatable-action add-bg"
                                onClick={() => showModal("add")}
                              >
                                <i className="fa fa-plus"></i> Нэмэх
                              </button>
                              <button
                                className="datatable-action edit-bg"
                                onClick={() => showModal("edit")}
                              >
                                <i className="fa fa-edit"></i> Засах
                              </button>
                              <button
                                className="datatable-action delete-bg"
                                onClick={() => showModal("delete")}
                              >
                                <i className="fa fa-trash"></i> Устгах
                              </button>
                            </div>
                          </div>
                          <Tree onSelect={onSelect} treeData={treeData} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
      {/* Add */}
      <Modal
        visible={visible && visible.add}
        title="Сошиал суваг нэмэх"
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
                  handleAdd(values);
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
                label="Сошиал суваг"
                name="name"
                rules={[requiredRule]}
                hasFeedback
              >
                <Input placeholder="Сошиал суваг оруулна уу жич: facebook, twitter..." />
              </Form.Item>
            </div>
            <div className="col-12">
              <Form.Item
                label="Линк"
                name="link"
                rules={[requiredRule]}
                hasFeedback
              >
                <Input placeholder="Линк оруулна уу" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
      {/* edit */}
      <Modal
        visible={visible && visible.edit}
        title="Сошиал суваг шинчлэх"
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
                  handelEdit(values);
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
                label="Сошиал суваг"
                name="name"
                rules={[requiredRule]}
                hasFeedback
              >
                <Input placeholder="Сошиал суваг оруулна уу жич: facebook, twitter..." />
              </Form.Item>
            </div>
            <div className="col-12">
              <Form.Item
                label="Линк"
                name="link"
                rules={[requiredRule]}
                hasFeedback
              >
                <Input placeholder="Линк оруулна уу" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
      {/* Delete */}
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
            onClick={() => handleDelete()}
          >
            Устгах
          </Button>,
        ]}
      >
        <p>Та устгахдаа итгэлтэй байна уу? </p>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    links: state.socialLinkReducer.links,
    success: state.socialLinkReducer.success,
    error: state.socialLinkReducer.error,
    loading: state.socialLinkReducer.loading,
    link: state.socialLinkReducer.link,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    tinymceAddPhoto: (file) => dispatch(tinymceAddPhoto(file)),
    getLink: (id) => dispatch(actions.getLink(id)),
    createLink: (data) => dispatch(actions.createLink(data)),
    updateLink: (id, data) => dispatch(actions.updateLink(id, data)),
    loadLinks: () => dispatch(actions.loadLinks()),
    deleteLink: (id) => dispatch(actions.deleteLink(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WebSettings);
