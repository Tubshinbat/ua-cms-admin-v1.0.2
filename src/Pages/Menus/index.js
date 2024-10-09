import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Tree,
  Select,
  message,
} from "antd";
import { connect } from "react-redux";
import { InboxOutlined } from "@ant-design/icons";

// Actions
import * as actions from "../../redux/actions/menuActions";
import axios from "../../axios-base";

// Components
import Menus from "./menu";
import { toastControl } from "../../lib/toasControl";
import Loader from "../../Components/Generals/Loader";
import Dragger from "antd/lib/upload/Dragger";
import base from "../../base";
import { useCookies } from "react-cookie";
import TextArea from "antd/lib/input/TextArea";

const requiredRule = {
  required: true,
  message: "Тус талбарыг заавал бөглөнө үү",
};

const SiteMenu = (props) => {
  const [form] = Form.useForm();

  // STATES
  const [gData, setGData] = useState([]);
  const [cookies] = useCookies(["language"]);

  const [loading, setLoading] = useState(false);
  const [select, setSelect] = useState([]);
  const [picture, setPicture] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectData, setSelectData] = useState(null);
  const [isModel, setIsModel] = useState(false);
  const [isDirect, setIsDirect] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(true);
  const [cover, setCover] = useState({});
  const [modal, setModal] = useState(null);

  const menuGenerateData = (categories) => {
    let datas = [];
    if (categories) {
      categories.map((el) => {
        datas.push({
          title:
            el[cookies.language] && el[cookies.language].name ? (
              el[cookies.language].name
            ) : (
              <span className="red-color">
                {el[cookies.language === "eng" ? "mn" : "eng"] &&
                  el[cookies.language === "eng" ? "mn" : "eng"].name}
              </span>
            ),
          key: el._id,
          children: el.children && menuGenerateData(el.children),
        });
      });
    }

    return datas;
  };

  const [visible, setVisible] = useState(false);

  // USEEFFECTS
  useEffect(() => {
    init();
    return () => {
      clear();
    };
  }, []);

  useEffect(() => {
    props.loadMenus();
  }, [cookies.language]);

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
    props.loadMenus();
    return () => {
      clear();
    };
  };

  const clear = () => {
    props.clear();
    form.resetFields();
    setIsDirect(false);
    setIsModel(false);
    setSelectedStatus(true);
    setPicture(null);
    setSelect(null);
    setSelectData(null);
    setModal(null);
  };

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

  const onSelect = (selectKey, element) => {
    setSelect(selectKey);
    if (selectKey.length > 0) {
      props.getMenu(selectKey[0]);
    } else {
      setSelectData(null);
    }
  };

  // -- CRUD FUNCTIONS
  const add = (values) => {
    values.isDirect = isDirect;
    values.isModel = isModel;
    values.status = selectedStatus;
    if (cover) values.cover = cover.name;
    const data = {
      ...values,
    };

    props.saveMenu(data);
  };

  const addParent = (values) => {
    values.parentId = selectData._id;
    values.isDirect = isDirect;
    values.isModel = isModel;
    values.status = selectedStatus;
    if (cover) values.cover = cover.name;
    const data = {
      ...values,
    };
    props.saveMenu(data);
  };

  const editMenu = (values) => {
    values.isDirect = isDirect;
    values.isModel = isModel;
    values.status = selectedStatus;
    if (cover) values.cover = cover.name;
    else values.cover = "";
    const data = {
      ...values,
    };

    props.updateMenu(data, select[0]);
    handleCancel();
  };

  const deleteMenu = () => {
    props.deleteMenu(select[0], selectData);
    setSelect([]);
    setSelectData({});
    handleCancel();
  };

  const setData = () => {
    form.setFieldsValue({
      ...props.category,
      name:
        props.category[cookies.language] &&
        props.category[cookies.language].name,
      short:
        props.category[cookies.language] &&
        props.category[cookies.language].short,
    });

    setSelectedStatus(props.category.status);
    setIsDirect(props.category.isDirect);
    setIsModel(props.category.isModel);

    if (props.category) {
      const { picture } = props.category;
      setPicture({
        name: picture,
        url: base.cdnUrl + "/150x150/" + picture,
      });
    }
  };

  // -- MODAL SHOW AND CLOSE
  const showModal = (modal) => {
    setModal(modal);
    if (modal != "add") {
      if (select?.length && select.length === 1) {
      } else {
        toastControl("error", "Нэг өгөгдөл сонгоно уу");
        return false;
      }
    }

    if (modal == "edit") {
      setData();
    }
    if (modal != "delete") {
      setVisible(true);
    }

    // switch (modal) {
    //   case "delete": {
    //     if (select && select.length === 1) {
    //       setVisible((sb) => ({ ...sb, [modal]: true }));
    //     } else {
    //       toastControl("error", "Нэг өгөгдөл сонгоно уу");
    //     }
    //     break;
    //   }
    //   case "parent": {
    //     if (select && select.length === 1) {
    //       setVisible((sb) => ({ ...sb, [modal]: true }));
    //       setCover();
    //     } else {
    //       toastControl("error", "Нэг өгөгдөл сонгоно уу");
    //     }
    //     break;
    //   }
    //   case "edit": {
    //     if (select && select.length === 1) {
    //       form.setFieldsValue({
    //         ...props.category,
    //         name:
    //           props.category[cookies.language] &&
    //           props.category[cookies.language].name,
    //       });
    //       setIsDirect(props.category.isDirect);
    //       setIsModel(props.category.isModel);
    //       setSelectedStatus(props.category.status);
    //       if (props.category.cover) {
    //         const url = base.cdnUrl + props.category.cover;
    //         const img = {
    //           name: props.category.cover,
    //           url,
    //         };
    //         setCover(img);
    //       }
    //       setVisible((sb) => ({ ...sb, [modal]: true }));
    //     } else {
    //       toastControl("error", "Нэг өгөгдөл сонгоно уу");
    //     }
    //     break;
    //   }
    //   default: {
    //     setVisible((sb) => ({ ...sb, [modal]: true }));
    //     setCover();
    //     break;
    //   }
    // }
  };

  const handleSubmit = (values) => {
    if (!picture?.name) {
      toastControl("error", "Зураг оруулна уу");
      return false;
    }

    const data = {
      ...values,
      isDirect,
      isModel,
      status: selectedStatus,
      picture: picture?.name,
    };

    console.log(data);

    if (selectData?._id && modal == "parent") data.parentId = selectData._id;

    switch (modal) {
      case "add":
        props.saveMenu(data);
        break;
      case "parent":
        props.saveMenu(data);
        break;
      case "edit":
        props.updateMenu(data, select[0]);
        break;
    }

    handleCancel();
  };

  const handleCancel = () => {
    setVisible(false);
    clear();
  };

  const handleRemove = () => {
    setPicture(null);
    axios
      .delete("/imgupload", { data: { file: picture.name } })
      .then((succ) => {
        toastControl("success", "Амжилттай файл устгагдлаа");
      })
      .catch((error) =>
        toastControl("error", "Файл устгах явцад алдаа гарлаа")
      );
  };

  const uploadImage = async (options) => {
    const { onSuccess, onError, file, onProgress } = options;
    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
      onUploadProgress: (event) => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        setProgress(percent);
        if (percent === 100) {
          setTimeout(() => setProgress(0), 1000);
        }
        onProgress({ percent: (event.loaded / event.total) * 100 });
      },
    };

    fmData.append("file", file);
    try {
      const res = await axios.post("/imgupload", fmData, config);
      const img = {
        name: res.data.data,
        url: `${base.cdnUrl}${res.data.data}`,
      };

      setPicture((bp) => {
        if (bp && bp.name) {
          axios.delete("/imgupload", { data: { file: bp.name } });
        }
        return img;
      });
      onSuccess("Ok");
      message.success(res.data.data + " Хуулагдлаа");
      return img;
    } catch (err) {
      toastControl("error", err);
      onError({ err });
      return false;
    }
  };

  const uploadOptions = {
    onRemove: (file) => handleRemove(file),
    fileList: picture && picture.name && [picture],
    customRequest: uploadImage,
    accept: "image/*",
    name: "picture",
    listType: "picture",
    maxCount: 1,
  };

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
                    <button
                      className="datatable-action add-bg"
                      onClick={() => showModal("add")}
                    >
                      <i className="fa fa-plus"></i> Цэс нэмэх
                    </button>
                    <button
                      className={`datatable-action add-bg ${
                        select && select.length > 0 && "active"
                      }`}
                      onClick={() => showModal("parent")}
                    >
                      <i className="fa fa-plus"></i> Дэд цэс нэмэх
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
                      СОНГОГДСОН ЦЭС:
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

      <Modal
        visible={visible}
        title="Ангилал"
        onCancel={() => handleCancel()}
        footer={[
          <Button key="back" onClick={() => handleCancel()}>
            Хаах
          </Button>,
          <Button
            loading={props.loading}
            key="submit"
            htmlType="submit"
            type="primary"
            onClick={() => {
              form
                .validateFields()
                .then((values) => handleSubmit(values))
                .catch((error) => console.log(error));
            }}
          >
            Хадгалах
          </Button>,
        ]}
      >
        <Form layout="vertical" form={form}>
          <div className="row">
            <div className="col-md-4">
              <Form.Item label="Идэвхтэй эсэх" name="status">
                <Switch
                  onChange={(value) => setSelectedStatus(value)}
                  checked={selectedStatus}
                />
              </Form.Item>
            </div>
            <div className="col-md-4">
              <Form.Item label="Линк холбох" name="isDirect">
                <Switch
                  checked={isDirect}
                  onChange={(value) => {
                    isModel === false
                      ? setIsDirect(value)
                      : toastControl(
                          "error",
                          "Нэг модал, линк хоёрын аль нэгийг сонгоно уу"
                        );
                  }}
                />
              </Form.Item>
            </div>
            <div className="col-md-4">
              <Form.Item label="Модал холбох" name="isModel">
                <Switch
                  checked={isModel}
                  onChange={(value) => {
                    isDirect === false
                      ? setIsModel(value)
                      : toastControl(
                          "error",
                          "Нэг модал, линк хоёрын аль нэгийг сонгоно уу"
                        );
                  }}
                />
              </Form.Item>
            </div>
            <div className="col-md-12">
              <Form.Item label="Цэсний нэр" name="name" rules={[requiredRule]}>
                <Input placeholder="Цэсний нэрийг оруулна уу" />
              </Form.Item>
            </div>
            <div className="col-md-12">
              <Form.Item label="Цэсний товч тайлбар" name="short">
                <TextArea />
              </Form.Item>
            </div>
            <div
              className="col-md-12"
              style={{ display: isDirect == true ? "block" : "none" }}
            >
              <Form.Item
                label="Үсрэх линк"
                name="direct"
                rules={isDirect === true && [requiredRule]}
              >
                <Input placeholder="Холбох линкээ оруулна уу" />
              </Form.Item>
            </div>
            <div
              className="col-md-12"
              style={{ display: isModel == true ? "block" : "none" }}
            >
              <Form.Item
                label="Модал сонгох"
                name="model"
                rules={isModel === true && [requiredRule]}
              >
                <Select
                  placeholder="Модал сонгох"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    {
                      value: "news",
                      label: "Мэдээ мэдээлэл",
                    },
                    {
                      value: "employee",
                      label: "Ажилчид",
                    },
                    {
                      value: "contact",
                      label: "Холбоо барих",
                    },
                  ]}
                />
              </Form.Item>
            </div>
            <div className="col-md-12">
              <Dragger {...uploadOptions} className="upload-list-inline">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Зургаа энэ хэсэг рүү чирч оруулна уу
                </p>
                <p className="ant-upload-hint">
                  Нэг болон түүнээс дээш файл хуулах боломжтой
                </p>
              </Dragger>
            </div>
          </div>
        </Form>
      </Modal>

      <Modal
        visible={modal == "delete"}
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
          Та <b> {selectData && selectData.name} </b> - ангилалыг устгахдаа
          итгэлтэй байна уу?{" "}
        </p>
      </Modal>

      {/* Add category */}
      {/* <Modal
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
            <div className="col-4">
              <Form.Item label="Идэвхтэй эсэх" name="status">
                <Switch
                  onChange={(value) => setSelectedStatus(value)}
                  checked={selectedStatus}
                />
              </Form.Item>
            </div>

            <div className="col-4">
              <Form.Item label="Линк холбох" name="isDirect">
                <Switch
                  checked={isDirect}
                  onChange={(value) => {
                    isModel === false
                      ? setIsDirect(value)
                      : toastControl(
                          "error",
                          "Нэг модал, линк хоёрын аль нэгийг сонгоно уу"
                        );
                  }}
                />
              </Form.Item>
            </div>

            <div className="col-4">
              <Form.Item label="Модал холбох" name="isModel">
                <Switch
                  checked={isModel}
                  onChange={(value) => {
                    isDirect === false
                      ? setIsModel(value)
                      : toastControl(
                          "error",
                          "Нэг модал, линк хоёрын аль нэгийг сонгоно уу"
                        );
                  }}
                />
              </Form.Item>
            </div>

            <div className="col-12">
              <Form.Item label="Цэсний нэр" name="name" rules={[requiredRule]}>
                <Input placeholder="Цэсний нэрийг оруулна уу" />
              </Form.Item>
            </div>
            <div className="col-12">
              <Form.Item label="Цэсний товч тайлбар" name="short">
                <TextArea />
              </Form.Item>
            </div>
            <div
              className="col-12"
              style={{ display: isDirect == true ? "block" : "none" }}
            >
              <Form.Item
                label="Үсрэх линк"
                name="direct"
                rules={isDirect === true && [requiredRule]}
              >
                <Input placeholder="Холбох линкээ оруулна уу" />
              </Form.Item>
            </div>
            <div
              className="col-12"
              style={{ display: isModel == true ? "block" : "none" }}
            >
              <Form.Item
                label="Модал сонгох"
                name="model"
                rules={isModel === true && [requiredRule]}
              >
                <Select
                  placeholder="Модал сонгох"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    {
                      value: "news",
                      label: "Мэдээ мэдээлэл",
                    },
                    {
                      value: "employee",
                      label: "Ажилчид",
                    },
                    {
                      value: "contact",
                      label: "Холбоо барих",
                    },
                  ]}
                />
              </Form.Item>
            </div>
            <div className="col-md-12">
              <Dragger className="upload-list-inline">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Зургаа энэ хэсэг рүү чирч оруулна уу
                </p>
                <p className="ant-upload-hint">
                  Нэг болон түүнээс дээш файл хуулах боломжтой
                </p>
              </Dragger>
            </div>
          </div>
        </Form>
      </Modal> */}
      {/* Parent category */}
      {/* <Modal
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
            <div className="col-4">
              <Form.Item label="Идэвхтэй эсэх" name="status">
                <Switch
                  onChange={(value) => setSelectedStatus(value)}
                  checked={selectedStatus}
                />
              </Form.Item>
            </div>

            <div className="col-4">
              <Form.Item label="Линк холбох" name="isDirect">
                <Switch
                  checked={isDirect}
                  onChange={(value) => {
                    isModel === false
                      ? setIsDirect(value)
                      : toastControl(
                          "error",
                          "Нэг модал, линк хоёрын аль нэгийг сонгоно уу"
                        );
                  }}
                />
              </Form.Item>
            </div>

            <div className="col-4">
              <Form.Item label="Модал холбох" name="isModel">
                <Switch
                  checked={isModel}
                  onChange={(value) => {
                    isDirect === false
                      ? setIsModel(value)
                      : toastControl(
                          "error",
                          "Нэг модал, линк хоёрын аль нэгийг сонгоно уу"
                        );
                  }}
                />
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
            <div
              className="col-12"
              style={{ display: isDirect == true ? "block" : "none" }}
            >
              <Form.Item
                label="Үсрэх линк"
                name="direct"
                rules={isDirect === true && [requiredRule]}
              >
                <Input placeholder="Холбох линкээ оруулна уу" />
              </Form.Item>
            </div>
            <div
              className="col-12"
              style={{ display: isModel == true ? "block" : "none" }}
            >
              <Form.Item
                label="Модал сонгох"
                name="model"
                rules={isModel === true && [requiredRule]}
              >
                <Select
                  placeholder="Модал сонгох"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    {
                      value: "news",
                      label: "Мэдээ мэдээлэл",
                    },
                    {
                      value: "employee",
                      label: "Ажилчид",
                    },
                    {
                      value: "contact",
                      label: "Холбоо барих",
                    },
                  ]}
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal> */}
      {/* Edit Category */}
      {/* <Modal
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
            <div className="col-4">
              <Form.Item label="Идэвхтэй эсэх" name="status">
                <Switch
                  onChange={(value) => setSelectedStatus(value)}
                  checked={selectedStatus}
                />
              </Form.Item>
            </div>

            <div className="col-4">
              <Form.Item label="Линк холбох" name="isDirect">
                <Switch
                  checked={isDirect}
                  onChange={(value) => {
                    isModel === false
                      ? setIsDirect(value)
                      : toastControl(
                          "error",
                          "Нэг модал, линк хоёрын аль нэгийг сонгоно уу"
                        );
                  }}
                />
              </Form.Item>
            </div>

            <div className="col-4">
              <Form.Item label="Модал холбох" name="isModel">
                <Switch
                  checked={isModel}
                  onChange={(value) => {
                    isDirect === false
                      ? setIsModel(value)
                      : toastControl(
                          "error",
                          "Нэг модал, линк хоёрын аль нэгийг сонгоно уу"
                        );
                  }}
                />
              </Form.Item>
            </div>

            <div className="col-12">
              <Form.Item label="Цэсний нэр" name="name" rules={[requiredRule]}>
                <Input placeholder="Цэсний нэрийг оруулна уу" />
              </Form.Item>
            </div>
            <div
              className="col-12"
              style={{ display: isDirect == true ? "block" : "none" }}
            >
              <Form.Item
                label="Үсрэх линк"
                name="direct"
                rules={isDirect === true && [requiredRule]}
              >
                <Input placeholder="Холбох линкээ оруулна уу" />
              </Form.Item>
            </div>
            <div
              className="col-12"
              style={{ display: isModel == true ? "block" : "none" }}
            >
              <Form.Item
                label="Модал сонгох"
                name="model"
                rules={isModel === true && [requiredRule]}
              >
                <Select
                  placeholder="Модал сонгох"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    {
                      value: "news",
                      label: "Мэдээ мэдээлэл",
                    },
                    {
                      value: "employee",
                      label: "Ажилчид",
                    },
                    {
                      value: "contact",
                      label: "Холбоо барих",
                    },
                  ]}
                />
              </Form.Item>
            </div>
            <div className="col-md-12">
              <Dragger className="upload-list-inline">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Зургаа энэ хэсэг рүү чирч оруулна уу
                </p>
                <p className="ant-upload-hint">
                  Нэг болон түүнээс дээш файл хуулах боломжтой
                </p>
              </Dragger>
            </div>
          </div>
        </Form>
      </Modal>
      */}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    success: state.menuReducer.success,
    error: state.menuReducer.error,
    loading: state.menuReducer.loading,
    categories: state.menuReducer.menus,
    category: state.menuReducer.menu,
  };
};

const mapDispatchToProp = (dispatch) => {
  return {
    saveMenu: (data) => dispatch(actions.saveMenu(data)),
    loadMenus: () => dispatch(actions.loadMenus()),
    getMenu: (id) => dispatch(actions.getMenu(id)),
    changePosition: (data) => dispatch(actions.changePosition(data)),
    updateMenu: (data, id) => dispatch(actions.updateMenu(data, id)),
    deleteMenu: (id) => dispatch(actions.deleteMenu(id)),
    clear: () => dispatch(actions.clear()),
  };
};

export default connect(mapStateToProps, mapDispatchToProp)(SiteMenu);
