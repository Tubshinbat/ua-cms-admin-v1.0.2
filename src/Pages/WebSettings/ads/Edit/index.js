import React, { useEffect, useState } from "react";
import { Form, Input, Button, Switch, Upload, message, Select } from "antd";
import { connect } from "react-redux";
import { Editor } from "@tinymce/tinymce-react";
import InputColor from "react-input-color";

//Components
import PageTitle from "../../../../Components/PageTitle";
import { InboxOutlined } from "@ant-design/icons";
import Loader from "../../../../Components/Generals/Loader";

//Actions
import { tinymceAddPhoto } from "../../../../redux/actions/imageActions";

import * as actions from "../../../../redux/actions/adsActions";

// Lib
import base from "../../../../base";
import axios from "../../../../axios-base";
import { toastControl } from "src/lib/toasControl";
import { convertFromdata } from "../../../../lib/handleFunction";
import { useCookies } from "react-cookie";

const requiredRule = {
  required: true,
  message: "Тус талбарыг заавал бөглөнө үү",
};

const { Dragger } = Upload;

const Edit = (props) => {
  const [form] = Form.useForm();
  const [cookies] = useCookies(["language"]);
  const [picture, setPicture] = useState({});
  const [video, setVideo] = useState({});
  const [deleteFiles, setDeleteFiles] = useState([]);
  const { TextArea } = Input;
  const [type, setType] = useState("photo");
  const [selectedStatus, setSelectedStatus] = useState(true);
  const [setProgress] = useState(0);
  const [color, setColor] = useState("#fff");
  const [loading, setLoading] = useState({
    visible: false,
    message: "",
  });

  // FUNCTIONS
  const init = () => {
    props.getAds(props.match.params.id);
  };

  const clear = () => {
    props.clear();
    form.resetFields();
    setPicture({});
    setVideo({});
    setLoading(false);
  };

  // -- TREE FUNCTIONS

  const handleAdd = (values, status = null) => {
    values.status = selectedStatus;
    if (status == "draft") values.status = false;
    values.banner = picture.name;

    const data = {
      ...values,
      color,
    };

    if (!picture.name) {
      toastControl("error", "Баннер оруулна уу");
    } else {
      deleteFiles &&
        deleteFiles.length > 0 &&
        deleteFiles.map(async (file) => {
          axios
            .delete("/imgupload", { data: { file: file.name } })
            .then((succ) => {
              toastControl("success", "Амжилттай файл устгагдлаа");
            })
            .catch((error) =>
              toastControl("error", "Файл устгах явцад алдаа гарлаа")
            );
        });
      const sendData = convertFromdata(data);
      props.updateAds(props.match.params.id, sendData);
    }
  };

  const handleRemove = (stType, file) => {
    setPicture({});

    setDeleteFiles((bfiles) => [...bfiles, file]);
  };

  // CONFIGS

  const uploadImage = async (options, type) => {
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
      let url = "/imgupload";
      if (type == "video") url = "/imgupload/file";
      const res = await axios.post(url, fmData, config);
      const img = {
        name: res.data.data,
        url: `${base.cdnUrl}${res.data.data}`,
      };

      if (type == "photo") setPicture(img);
      else setVideo(img);

      onSuccess("Ok");
      message.success(res.data.data + " Хуулагдлаа");
      return img;
    } catch (err) {
      toastControl("error", err);
      onError({ err });
      return false;
    }
  };

  const photoOptions = {
    onRemove: (file) => handleRemove("picture", file),
    fileList: picture && picture.name && [picture],
    customRequest: (options) => uploadImage(options, "photo"),
    accept: "image/*",
    name: "pictures",
    listType: "picture",
    multiple: true,
  };

  const videoOptions = {
    onRemove: (file) => handleRemove("video", file),
    fileList: video && video.name && [video],
    customRequest: (options) => uploadImage(options, "video"),
    accept: "video/*",
    name: "video",
    listType: "video",
    multiple: true,
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
      setTimeout(() => props.history.replace("/web_settings/ads"), 2000);
    }
  }, [props.success]);

  useEffect(() => {
    if (props.ads) {
      form.setFieldsValue({ ...props.ads });

      if (props.ads.banner)
        setPicture({
          name: props.ads.banner,
          url: `${base.cdnUrl}150x150/${props.ads.banner}`,
        });

      setSelectedStatus(props.ads.status);
    }
  }, [props.ads]);

  useEffect(() => {
    props.getAds(props.match.params.id);
  }, [cookies.language]);

  return (
    <>
      <div className="content-wrapper">
        <PageTitle name="Баннер шинэчлэх" />
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
                          <Form.Item label="Линк" name="link" hasFeedback>
                            <Input placeholder="Холбох линкээ оруулна уу" />
                          </Form.Item>
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
                        <div className="col-6">
                          <Form.Item
                            label="Идэвхтэй эсэх"
                            name="status"
                            hasFeedback
                          >
                            <Switch
                              checkedChildren="Идэвхтэй"
                              unCheckedChildren="Идэвхгүй"
                              size="medium"
                              checked={selectedStatus}
                              onChange={(value) => setSelectedStatus(value)}
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
                                handleAdd(values);
                              })
                              .catch((info) => {
                                // console.log(info);
                              });
                          }}
                        >
                          Хадгалах
                        </Button>
                        <Button
                          key="draft"
                          type="primary"
                          onClick={() => {
                            form
                              .validateFields()
                              .then((values) => {
                                handleAdd(values, "draft");
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

                  <div
                    className="card"
                    style={{ display: type == "photo" ? "flex" : "none" }}
                  >
                    <div class="card-header">
                      <h3 class="card-title">Зураг оруулах</h3>
                    </div>
                    <div className="card-body">
                      <Dragger {...photoOptions} className="upload-list-inline">
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
    success: state.adsReducer.success,
    error: state.adsReducer.error,
    loading: state.adsReducer.loading,
    ads: state.adsReducer.ads,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAds: (id) => dispatch(actions.getAds(id)),
    tinymceAddPhoto: (file) => dispatch(tinymceAddPhoto(file)),
    updateAds: (id, data) => dispatch(actions.updateAds(id, data)),
    clear: () => dispatch(actions.clear()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Edit);
