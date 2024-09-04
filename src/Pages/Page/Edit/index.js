import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Switch,
  Tree,
  Upload,
  message,
  Select,
} from "antd";
import { connect } from "react-redux";
import { Editor } from "@tinymce/tinymce-react";
//ComponentsХН
import PageTitle from "../../../Components/PageTitle";
import { InboxOutlined } from "@ant-design/icons";
import Loader from "../../../Components/Generals/Loader";

//Actions
import { tinymceAddPhoto } from "../../../redux/actions/imageActions";
import { loadMenus } from "../../../redux/actions/menuActions";
import { loadFooterMenus } from "../../../redux/actions/footerMenuActions";
import { loadPositions } from "../../../redux/actions/positionActions";
import * as actions from "../../../redux/actions/pageActions";

// Lib

import base from "../../../base";
import axios from "../../../axios-base";
import { toastControl } from "src/lib/toasControl";
import { convertFromdata } from "../../../lib/handleFunction";
import { useCookies } from "react-cookie";

const requiredRule = {
  required: true,
  message: "Тус талбарыг заавал бөглөнө үү",
};

const { Dragger } = Upload;

const Add = (props) => {
  const [form] = Form.useForm();
  const [cookies] = useCookies(["language"]);
  const [pictures, setPictures] = useState([]);

  const [checkedKeys, setCheckedKeys] = useState([]);
  const [checkedMenu, setCheckedMenu] = useState([]);
  const [checkedFooterMenu, setCheckedFooterMenu] = useState([]);
  const [checkedPosition, setCheckedPosition] = useState([]);
  const [choiseData, setChoiseData] = useState();
  const [gData, setGData] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [footerMenuData, setFooterMenuData] = useState([]);
  const [positionData, setPositionData] = useState([]);

  const [status, setStatus] = useState(true);
  const [listActive, setListActive] = useState(false);
  const [sideActive, setSideActive] = useState(true);
  const [parentActive, setParentActive] = useState(true);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState({
    visible: false,
    message: "",
  });

  // FUNCTIONS
  const init = () => {
    props.loadMenus();
    props.loadFooterMenus();
    props.loadPositions(`limit=1000`);
    props.getPage(props.match.params.id);
  };

  const clear = () => {
    props.clear();
    form.resetFields();
    setPictures([]);
  };

  const handleEdit = (values, st = null) => {
    if (pictures && pictures.length > 0) {
      const imgs = pictures.map((el) => el.name);
      values.pictures = imgs;
    }

    values.status = status;
    values.listActive = listActive;
    values.sideActive = sideActive;
    values.parentActive = parentActive;

    if (st == "draft") values.status = false;
    if (checkedMenu && checkedMenu.length > 0) values.menu = [...checkedMenu];
    if (checkedFooterMenu && checkedFooterMenu.length > 0)
      values.footerMenu = [...checkedFooterMenu];
    if (checkedPosition && checkedPosition.length > 0)
      values.position = [...checkedPosition];

    const data = {
      ...values,
    };

    const sendData = convertFromdata(data);
    props.updatePage(props.match.params.id, sendData);
  };

  const handleChange = (event) => {
    form.setFieldsValue({ pageInfo: event });
  };

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
      setPictures((bp) => [...bp, img]);
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
    onRemove: (file) => handleRemove("pictures", file),
    fileList: [...pictures],
    customRequest: uploadImage,
    accept: "image/*",
    name: "picture",
    multiple: true,
    listType: "picture",
  };

  const handleRemove = (stType, file) => {
    let index;
    let deleteFile;
    let list;

    index = pictures.indexOf(file);
    deleteFile = pictures[index].name;
    list = pictures.slice();
    list.splice(index, 1);
    setPictures(list);

    axios
      .delete("/imgupload", { data: { file: deleteFile } })
      .then((succ) => {
        toastControl("success", "Амжилттай файл устгагдлаа");
      })
      .catch((error) =>
        toastControl("error", "Файл устгах явцад алдаа гарлаа")
      );
  };

  // -- TREE FUNCTIONS
  const onCheckMenu = (values) => {
    setCheckedMenu(values);
  };

  const onCheckFooterMenu = (values) => {
    setCheckedFooterMenu(values);
  };

  const onCheckPosition = (values) => {
    setCheckedPosition(values);
  };

  // Useeffect

  useEffect(() => {
    init();
    return () => clear();
  }, []);

  useEffect(() => {
    if (props.menus && props.menus.length > 0) {
      const data = menuGenerateData(props.menus);
      setMenuData(data);
    }
  }, [props.menus]);

  useEffect(() => {
    if (props.footerMenus && props.footerMenus.length > 0) {
      const data = menuGenerateData(props.footerMenus);
      setFooterMenuData(data);
    }
  }, [props.footerMenus]);

  useEffect(() => {
    if (props.positions && props.positions.length > 0) {
      const data = menuGenerateData(props.positions);
      setPositionData(data);
    }
  }, [props.positions]);

  useEffect(() => {
    if (props.page) {
      const languageData = {
        name: !props.page[cookies.language]
          ? ""
          : props.page[cookies.language].name,
        pageInfo: !props.page[cookies.language]
          ? ""
          : props.page[cookies.language].pageInfo,
      };
      form.setFieldsValue({ ...props.page, ...languageData });
      setStatus(props.page.status);
      setListActive(props.page.listActive);
      setSideActive(props.page.sideActive);
      setParentActive(props.page.parentActive);

      if (props.page.pictures && props.page.pictures.length > 0) {
        setPictures(
          props.page.pictures.map((img) => ({
            name: img,
            url: `${base.cdnUrl}${img}`,
          }))
        );
      } else {
        setPictures(() => []);
      }

      if (props.page.menu && props.page.menu.length > 0) {
        setCheckedMenu(() => {
          return props.page.menu.map((cat) => cat._id);
        });
      }

      if (props.page.footerMenu && props.page.footerMenu.length > 0) {
        setCheckedFooterMenu(() => {
          return props.page.footerMenu.map((cat) => cat._id);
        });
      }

      if (props.page.position && props.page.position.length > 0) {
        setCheckedPosition(() => {
          return props.page.position.map((cat) => cat._id);
        });
      }
    }
  }, [props.page]);

  // Ямар нэгэн алдаа эсвэл амжилттай үйлдэл хийгдвэл энд useEffect барьж аваад TOAST харуулна
  useEffect(() => {
    toastControl("error", props.error);
  }, [props.error]);

  useEffect(() => {
    if (props.success) {
      toastControl("success", props.success);
      setTimeout(() => props.history.replace("/pages"), 2000);
    }
  }, [props.success]);

  useEffect(() => {
    init();
  }, [cookies.language]);

  return (
    <>
      <div className="content-wrapper">
        <PageTitle name="Сайтын хуудас шинэчлэх" />
        <div className="page-sub-menu"></div>
        <div className="content">
          <Loader show={loading.visible}> {loading.message} </Loader>
          <div className="container-fluid">
            <Form layout="vertical" form={form}>
              <div className="row">
                <div className="col-lg-8">
                  <div className="card card-primary">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12">
                          <Form.Item
                            label="Хуудасны нэр"
                            name="name"
                            rules={[requiredRule]}
                          >
                            <Input placeholder="Сайтын хуудасны нэр оруулна уу" />
                          </Form.Item>
                        </div>
                        <div className="col-12">
                          <Form.Item
                            label="Дэлгэрэнгүй"
                            name="pageInfo"
                            getValueFromEvent={(e) =>
                              e.target && e.target.getContent()
                            }
                          >
                            <Editor
                              apiKey="2nubq7tdhudthiy6wfb88xgs36os4z3f4tbtscdayg10vo1o"
                              init={{
                                height: 300,
                                menubar: false,
                                plugins: [
                                  "advlist textcolor autolink lists link image charmap print preview anchor tinydrive ",
                                  "searchreplace visualblocks code fullscreen",
                                  "insertdatetime media table paste code help wordcount image media  code  table  ",
                                ],
                                toolbar:
                                  "mybutton | addPdf |  image | undo redo | fontselect fontsizeselect formatselect blockquote  | bold italic forecolor  backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist outdent indent | removeformat | help | link  | quickbars | media | code | tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
                                file_picker_types: "image",
                                tinydrive_token_provider: `${base.apiUrl}users/jwt`,
                                automatic_uploads: false,
                                setup: (editor) => {
                                  editor.ui.registry.addButton("mybutton", {
                                    text: "Файл оруулах",
                                    onAction: () => {
                                      var input =
                                        document.createElement("input");
                                      input.setAttribute("type", "file");
                                      input.onchange = async function () {
                                        var file = this.files[0];
                                        const fData = new FormData();
                                        fData.append("file", file);
                                        setLoading({
                                          visible: true,
                                          message:
                                            "Түр хүлээнэ үү файл хуулж байна",
                                        });
                                        const res = await axios.post(
                                          "/file",
                                          fData
                                        );
                                        const url =
                                          `${base.cdnUrl}` + res.data.data;
                                        editor.insertContent(
                                          `<a href="${url}"> ${res.data.data} </a>`
                                        );
                                        setLoading({
                                          visible: false,
                                        });
                                      };
                                      input.click();
                                    },
                                  });
                                  editor.ui.registry.addButton("addPdf", {
                                    text: "PDF Файл оруулах",
                                    onAction: () => {
                                      let input =
                                        document.createElement("input");
                                      input.setAttribute("type", "file");
                                      input.setAttribute("accept", ".pdf");
                                      input.onchange = async function () {
                                        let file = this.files[0];
                                        const fData = new FormData();
                                        fData.append("file", file);
                                        setLoading({
                                          visible: true,
                                          message:
                                            "Түр хүлээнэ үү файл хуулж байна",
                                        });
                                        const res = await axios.post(
                                          "/file",
                                          fData
                                        );
                                        const url = base.cdnUrl + res.data.data;
                                        editor.insertContent(
                                          `<iframe src="${url}" style="width:100%; min-height: 500px"> </iframe>`
                                        );
                                        setLoading({
                                          visible: false,
                                        });
                                      };
                                      input.click();
                                    },
                                  });
                                },
                                file_picker_callback: function (
                                  cb,
                                  value,
                                  meta
                                ) {
                                  var input = document.createElement("input");
                                  input.setAttribute("type", "file");
                                  input.setAttribute("accept", "image/*");
                                  input.onchange = async function () {
                                    var file = this.files[0];
                                    const fData = new FormData();
                                    fData.append("file", file);
                                    const res = await axios.post(
                                      "/imgupload",
                                      fData
                                    );
                                    const url =
                                      `${base.cdnUrl}` + res.data.data;
                                    cb(url);
                                  };
                                  input.click();
                                },
                              }}
                              onEditorChange={(event) => handleChange(event)}
                            />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <div className="card">
                            <div class="card-header">
                              <h3 class="card-title">САЙТЫН ЦЭСНҮҮД</h3>
                            </div>
                            <div
                              className="card-body"
                              style={{ maxHeight: "400px", overflow: "auto" }}
                            >
                              <Form.Item name="menu">
                                <Tree
                                  treeCheckStrictly={true}
                                  checkable
                                  onCheck={onCheckMenu}
                                  checkedKeys={checkedMenu}
                                  treeData={menuData}
                                />
                              </Form.Item>
                            </div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="card">
                            <div class="card-header">
                              <h3 class="card-title">САЙТЫН ХӨЛНИЙ ЦЭСНҮҮД</h3>
                            </div>
                            <div
                              className="card-body"
                              style={{ maxHeight: "400px", overflow: "auto" }}
                            >
                              <Form.Item name="footermenu">
                                <Tree
                                  treeCheckStrictly={true}
                                  checkable
                                  onCheck={onCheckFooterMenu}
                                  checkedKeys={checkedFooterMenu}
                                  treeData={footerMenuData}
                                />
                              </Form.Item>
                            </div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="card">
                            <div class="card-header">
                              <h3 class="card-title">
                                ХАРЬЯАЛАГДАХ ХЭЛТЭС ОРУУЛАХ
                              </h3>
                            </div>
                            <div
                              className="card-body"
                              style={{ maxHeight: "400px", overflow: "auto" }}
                            >
                              <Form.Item name="positions">
                                <Tree
                                  treeCheckStrictly={true}
                                  checkable
                                  onCheck={onCheckPosition}
                                  checkedKeys={checkedPosition}
                                  treeData={positionData}
                                />
                              </Form.Item>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card">
                    <div class="card-header">
                      <h3 class="card-title">ТОХИРГОО</h3>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12">
                          <Form.Item
                            label={`Идэвхтэй эсэх`}
                            tooltip="Идэвхтэй байгаа тохиолдолд нийтэд харагдана"
                            name="status"
                          >
                            <Switch
                              checkedChildren="Идэвхтэй"
                              unCheckedChildren="Идэвхгүй"
                              size="medium"
                              checked={status}
                              onChange={(value) => setStatus(value)}
                            />
                          </Form.Item>
                        </div>
                        <div className="col-12">
                          <Form.Item
                            label={`Хамаарагдах цэснүүд жагсаалт хэлбэртэй харгадах`}
                            tooltip="Хамаарагдах цэснүүд жагсаалт хэлбэртэй харгадах"
                            name="listActive"
                          >
                            <Switch
                              checkedChildren="Идэвхтэй"
                              unCheckedChildren="Идэвхгүй"
                              size="medium"
                              checked={listActive}
                              onChange={(value) => setListActive(value)}
                            />
                          </Form.Item>
                        </div>
                        <div className="col-12">
                          <Form.Item
                            label={`Булан цэс харуулах`}
                            tooltip="Булан цэс харуулах"
                            name="sideActive"
                          >
                            <Switch
                              checkedChildren="Идэвхтэй"
                              unCheckedChildren="Идэвхгүй"
                              size="medium"
                              checked={sideActive}
                              onChange={(value) => setSideActive(value)}
                            />
                          </Form.Item>
                        </div>
                        <div className="col-12">
                          <Form.Item
                            label={`Хамтрагч компани харуулах`}
                            tooltip="Хамтрагч компани харуулах"
                            name="parentActive"
                          >
                            <Switch
                              checkedChildren="Идэвхтэй"
                              unCheckedChildren="Идэвхгүй"
                              size="medium"
                              checked={parentActive}
                              onChange={(value) => setParentActive(value)}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="control-bottons">
                        <Button
                          key="submit"
                          htmlType="submit"
                          className="add-button"
                          loading={props.loading}
                          onClick={() => {
                            form
                              .validateFields()
                              .then((values) => {
                                handleEdit(values);
                              })
                              .catch((info) => {
                                // console.log(info);
                              });
                          }}
                        >
                          Нэмэх
                        </Button>
                        <Button
                          key="draft"
                          type="primary"
                          onClick={() => {
                            form
                              .validateFields()
                              .then((values) => {
                                handleEdit(values, "draft");
                              })
                              .catch((info) => {
                                // console.log(info);
                              });
                          }}
                        >
                          Ноороглох
                        </Button>
                        <Button onClick={() => props.history.goBack()}>
                          Буцах
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div class="card-header">
                      <h3 class="card-title">Зураг оруулах</h3>
                    </div>
                    <div className="card-body">
                      <Dragger
                        {...uploadOptions}
                        className="upload-list-inline"
                      >
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
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    success: state.pageReducer.success,
    error: state.pageReducer.error,
    loading: state.pageReducer.loading,
    menus: state.menuReducer.menus,
    footerMenus: state.footerMenuReducer.footerMenus,
    partners: state.partnerReducer.partners,
    positions: state.positionReducer.positions,
    page: state.pageReducer.page,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadMenus: () => dispatch(loadMenus()),
    getPage: (id) => dispatch(actions.getPage(id)),
    loadFooterMenus: () => dispatch(loadFooterMenus()),
    loadPositions: (query) => dispatch(loadPositions(query)),
    updatePage: (id, data) => dispatch(actions.updatePage(id, data)),
    clear: () => dispatch(actions.clear()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Add);
