import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Switch,
  Tree,
  Upload,
  Space,
  Radio,
  message,
} from "antd";
import { connect } from "react-redux";
import { Editor } from "@tinymce/tinymce-react";

//Components
import PageTitle from "../../../Components/PageTitle";
import { InboxOutlined } from "@ant-design/icons";
import Loader from "../../../Components/Generals/Loader";

//Actions
import { tinymceAddPhoto } from "../../../redux/actions/imageActions";
import {
  loadMediaCategories,
  clear as clearCat,
} from "../../../redux/actions/mediaCategoryActions";
import * as actions from "../../../redux/actions/mediaActions";

// Lib
import base from "../../../base";
import axios from "../../../axios-base";
import { toastControl } from "src/lib/toasControl";
import { menuGenerateData } from "../../../lib/menuGenerate";
import { convertFromdata } from "../../../lib/handleFunction";
import { useCookies } from "react-cookie";

const requiredRule = {
  required: true,
  message: "Тус талбарыг заавал бөглөнө үү",
};

const { Dragger } = Upload;

const Edit = (props) => {
  const [form] = Form.useForm();
  const [cookies] = useCookies(["language"]);
  const [pictures, setPictures] = useState([]);
  const [audios, setAudios] = useState([]);
  const [videos, setVideos] = useState([]);
  const [type, setType] = useState("default");
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [checkedRadio, setCheckedRadio] = useState({
    status: true,
    star: false,
  });
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [gData, setGData] = useState([]);
  const [deleteFiles, setDeleteFiles] = useState([]);
  const [setProgress] = useState(0);
  const [loading, setLoading] = useState({
    visible: false,
    message: "",
  });

  // -- MODAL STATE

  // FUNCTIONS
  const init = () => {
    props.getMedia(props.match.params.id);
    props.loadMediaCategories();
  };

  const clear = () => {
    props.clear();
    props.clearCat();
    form.resetFields();
    setPictures([]);
    setAudios([]);
    setVideos([]);
    setType("default");
    setExpandedKeys([]);
    setSelectedKeys([]);
    setCheckedKeys([]);
    setGData([]);
    setLoading(false);
  };

  // -- TREE FUNCTIONS
  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue) => {
    // console.log(checkedKeysValue);
    setCheckedKeys(checkedKeysValue);
  };

  const handleRadio = (value, type) => {
    setCheckedRadio((bc) => ({ ...bc, [type]: value }));
  };

  const onSelect = (selectedKeysValue, info) => {
    // console.log("onSelect", info);
    setSelectedKeys(selectedKeysValue);
  };

  const handleChange = (event) => {
    form.setFieldsValue({ details: event });
  };

  const onChangeType = (e) => {
    setType(e.target.value);
  };

  const handleEdit = (values, status = null) => {
    const type = values.type || "default";

    switch (type) {
      case "video": {
        values.videos = videos.map((el) => el.name);
        break;
      }
      case "audio": {
        values.audios = audios.map((el) => el.name);
        break;
      }
      case "default": {
        break;
      }
    }
    if (pictures.length > 0) values.pictures = pictures.map((el) => el.name);
    else values.pictures = [];

    if (deleteFiles && deleteFiles.length > 0) {
      deleteFiles.map(async (deleteFile) => {
        await axios.delete("/imgupload", { data: { file: deleteFile } });
      });
    }

    const data = {
      ...values,
      star: values.star || false,
      type,
      categories: [...checkedKeys],
    };

    if (data.categories.length === 0) {
      data.categories = [];
    }

    if (status === "draft") {
      data.status = false;
    }

    const sendData = convertFromdata(data);
    props.updateMedia(props.match.params.id, sendData);
  };

  const setFunction = (stType, sData) => {
    switch (stType) {
      case "audios":
        setAudios((ba) => [...ba, sData]);
        break;
      case "pictures":
        setPictures((bp) => [...bp, sData]);
        break;
      case "videos":
        setVideos((bv) => [...bv, sData]);
        break;
      default:
        break;
    }
  };

  const handleRemove = (stType, file) => {
    let index;
    let deleteFile;
    let list;

    switch (stType) {
      case "audios":
        index = audios.indexOf(file);
        deleteFile = audios[index].name;
        list = audios.slice();
        list.splice(index, 1);
        setAudios(list);
        break;
      case "pictures":
        index = pictures.indexOf(file);
        deleteFile = pictures[index].name;
        list = pictures.slice();
        list.splice(index, 1);
        setPictures(list);
        break;
      case "videos":
        index = videos.indexOf(file);
        deleteFile = videos[index].name;
        list = videos.slice();
        list.splice(index, 1);
        setVideos(list);
        break;
      default:
        index = pictures.indexOf(list);
        deleteFile = pictures[index].name;
        list = pictures.slice();
        list.splice(index, 1);
        setPictures(list);
        break;
    }
    setDeleteFiles((bf) => [...bf, deleteFile]);
  };

  // CONFIGS

  const uploadFile = async (options, stType) => {
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
      setLoading({ visible: true, message: "Түр хүлээнэ үү файл хуулж байна" });
      const res = await axios.post("/imgupload/file", fmData, config);
      const data = {
        name: res.data.data,
        status: "done",
      };
      setFunction(stType, data);
      onSuccess("Ok");
      message.success(res.data.data + " Хуулагдлаа");
      setLoading({ visible: false, message: "" });
    } catch (error) {
      toastControl("error", error);
      onError({ error });
    }
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
      setPictures((bfPicture) => [...bfPicture, img]);
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

  const videoUploadOptions = {
    onRemove: (file) => handleRemove("videos", file),
    customRequest: (options) => uploadFile(options, "videos"),
    fileList: [...videos],
    accept: "video/*",
    name: "video",
    multiple: true,
  };

  const audioUploadOptions = {
    onRemove: (file) => handleRemove("audios", file),
    customRequest: (options) => uploadFile(options, "audios"),
    fileList: [...audios],
    accept: "audio/*",
    name: "audio",
    multiple: true,
  };

  // USEEFFECT
  useEffect(() => {
    init();
    return () => clear();
  }, []);

  useEffect(() => {
    if (props.media) {
      const languageData = {
        name: !props.media[cookies.language]
          ? ""
          : props.media[cookies.language].name,
        details: !props.media[cookies.language]
          ? ""
          : props.media[cookies.language].details,

        shortDetails: !props.media[cookies.language]
          ? ""
          : props.media[cookies.language].shortDetails,
      };

      form.setFieldsValue({ ...props.media, ...languageData });
      setCheckedRadio(() => ({
        star: props.media.star,
        status: props.media.status,
      }));
      props.media.audios &&
        props.media.audios.length > 0 &&
        setAudios(props.media.audios.map((audio) => ({ name: audio })));

      if (props.media.videos && props.media.videos.length > 0) {
        setVideos(props.media.videos.map((video) => ({ name: video })));
      } else {
        setVideos(() => []);
      }

      if (props.media.pictures && props.media.pictures.length > 0) {
        setPictures(
          props.media.pictures.map((img) => ({
            name: img,
            url: `${base.cdnUrl}${img}`,
          }))
        );
      } else {
        setPictures(() => []);
      }

      if (props.media.categories && props.media.categories.length > 0) {
        setCheckedKeys(() => {
          return props.media.categories.map((cat) => cat._id);
        });
      }

      setType(props.media.type);
    }
  }, [props.media]);

  useEffect(() => {
    const cat = props.categories.map((category) => {
      return {
        ...category,
        name: category[cookies.language] ? (
          category[cookies.language].name
        ) : (
          <span className="red-color">
            {category[cookies.language === "mn" ? "eng" : "mn"].name}
          </span>
        ),
      };
    });
    const data = menuGenerateData(cat);
    setGData(data);
  }, [props.categories]);

  useEffect(() => {
    props.getMedia(props.match.params.id);
    props.loadMediaCategories();
  }, [cookies.language]);

  useEffect(() => {
    setLoading({ visible: props.loading, message: "Түр хүлээнэ үү" });
  }, [props.loading]);

  // Ямар нэгэн алдаа эсвэл амжилттай үйлдэл хийгдвэл энд useEffect барьж аваад TOAST харуулна
  useEffect(() => {
    toastControl("error", props.error);
  }, [props.error]);

  useEffect(() => {
    if (props.success) {
      clear();
      toastControl("success", "Амжилттай засагдлаа");
      setTimeout(() => {
        props.history.replace("/media");
      }, 1000);
    }
  }, [props.success]);

  return (
    <>
      <div className="content-wrapper">
        <PageTitle name="Нийтлэл засварлах" />
        <div className="page-sub-menu"></div>
        <div className="content">
          <Loader show={loading.visible}> {loading.message} </Loader>
          <div className="container-fluid">
            <Form layout="vertical" form={form}>
              <div className="row">
                <div className="col-8">
                  <div className="card card-primary">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12">
                          <Form.Item
                            label="Мэдээний гарчиг"
                            name="name"
                            rules={[requiredRule]}
                            hasFeedback
                          >
                            <Input placeholder="Мэдээний гарчиг оруулна уу" />
                          </Form.Item>
                        </div>
                        <div className="col-12">
                          <Form.Item
                            label="Мэдээний дэлгэрэнгүй"
                            name="details"
                            getValueFromEvent={(e) =>
                              e.target && e.target.getContent()
                            }
                            rules={[requiredRule]}
                          >
                            <Editor
                              apiKey="2nubq7tdhudthiy6wfb88xgs36os4z3f4tbtscdayg10vo1o"
                              init={{
                                height: 300,
                                menubar: false,
                                plugins: [
                                  "advlist autolink lists link image  tinydrive charmap print preview anchor",
                                  "searchreplace visualblocks code fullscreen",
                                  "insertdatetime media table paste code help wordcount image media  code  table  ",
                                ],
                                toolbar:
                                  "mybutton image | undo redo | fontselect fontsizeselect formatselect blockquote  | bold italic backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist outdent indent | removeformat | help | link  | quickbars | media | code | tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
                                tinydrive_token_provider: `${base.apiUrl}users/jwt`,
                                file_picker_types: "image",
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
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6">
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
                    {type === "video" && (
                      <div className="col-6">
                        <div className="card">
                          <div class="card-header">
                            <h3 class="card-title">Видео оруулах</h3>
                          </div>
                          <div className="card-body">
                            <Dragger
                              {...videoUploadOptions}
                              className="upload-list-inline"
                            >
                              <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                              </p>
                              <p className="ant-upload-text">
                                Видеогоо энэ хэсэг рүү чирч оруулна уу
                              </p>
                              <p className="ant-upload-hint">
                                Нэг болон түүнээс дээш файл хуулах боломжтой
                              </p>
                            </Dragger>
                          </div>
                        </div>
                      </div>
                    )}
                    {type === "audio" && (
                      <div className="col-6">
                        <div className="card">
                          <div class="card-header">
                            <h3 class="card-title">Аудио оруулах</h3>
                          </div>
                          <div className="card-body">
                            <Dragger
                              {...audioUploadOptions}
                              className="upload-list-inline"
                            >
                              <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                              </p>
                              <p className="ant-upload-text">
                                Аудиогоо энэ хэсэг рүү чирч оруулна уу
                              </p>
                              <p className="ant-upload-hint">
                                Нэг болон түүнээс дээш файл хуулах боломжтой
                              </p>
                            </Dragger>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-4">
                  <div className="card">
                    <div class="card-header">
                      <h3 class="card-title">ТОХИРГОО</h3>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-6">
                          <Form.Item label="Идэвхтэй эсэх" name="status">
                            <Switch
                              checkedChildren="Идэвхтэй"
                              unCheckedChildren="Идэвхгүй"
                              size="medium"
                              checked={checkedRadio.status}
                              onChange={(checked) =>
                                handleRadio(checked, "status")
                              }
                            />
                          </Form.Item>
                        </div>
                        <div className="col-6">
                          <Form.Item label="Онцлох" name="star">
                            <Switch
                              size="medium"
                              checked={checkedRadio.star}
                              onChange={(checked) =>
                                handleRadio(checked, "star")
                              }
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
                          Шинэчлэх
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
                      <h3 class="card-title">ТӨРӨЛ</h3>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12">
                          <Form.Item name="type" value={type}>
                            <Radio.Group
                              defaultValue={type}
                              onChange={onChangeType}
                            >
                              <Space direction="vertical">
                                <Radio value={"default"}>Үндсэн</Radio>
                                <Radio value={"audio"}>Аудио</Radio>
                                <Radio value={"video"}>Видео</Radio>
                              </Space>
                            </Radio.Group>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div class="card-header">
                      <h3 class="card-title">АНГИЛАЛ</h3>
                    </div>
                    <div className="card-body">
                      <Form.Item name="categories">
                        <Tree
                          treeCheckStrictly={true}
                          checkable
                          onExpand={onExpand}
                          expandedKeys={expandedKeys}
                          autoExpandParent={autoExpandParent}
                          onCheck={onCheck}
                          checkedKeys={checkedKeys}
                          onSelect={onSelect}
                          selectedKeys={selectedKeys}
                          treeData={gData}
                        />
                      </Form.Item>
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
    categories: state.mediaCategoryReducer.categories,
    success: state.mediaReducer.success,
    error: state.mediaReducer.error,
    loading: state.mediaReducer.loading,
    media: state.mediaReducer.media,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    tinymceAddPhoto: (file) => dispatch(tinymceAddPhoto(file)),
    loadMediaCategories: () => dispatch(loadMediaCategories()),
    updateMedia: (id, data) => dispatch(actions.updateMedia(id, data)),
    getMedia: (id) => dispatch(actions.getMedia(id)),
    clear: () => dispatch(actions.clear()),
    clearCat: () => dispatch(clearCat()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Edit);
