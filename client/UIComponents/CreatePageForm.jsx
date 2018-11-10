import React from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Icon,
  Divider,
  Modal
} from 'antd/lib';
const Option = Select.Option;
const { TextArea } = Input;
const FormItem = Form.Item;

class CreatePageForm extends React.Component {
  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!this.props.uploadableImage) {
        Modal.error({
          title: 'Image is required',
          content: 'Please upload an image'
        });
        return;
      }

      const values = {
        title: fieldsValue['title'],
        description: fieldsValue['description']
      };

      if (!err) {
        this.props.registerPageLocally(values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { uploadableImage, setUploadableImage, pageData } = this.props;

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    };

    return (
      <div className="create-gathering-form">
        <h3>Please enter the details below</h3>
        <Divider />

        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="Title">
            {getFieldDecorator('title', {
              rules: [
                {
                  required: true,
                  message: 'Please enter the Title'
                }
              ],
              initialValue: groupData ? groupData.title : null
            })(<Input placeholder="Booking title" />)}
          </FormItem>

          <FormItem {...formItemLayout} label="Description">
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: 'Please enter a detailed description'
                }
              ],
              initialValue: groupData ? groupData.description : null
            })(
              <TextArea
                placeholder="Enter a description for your study group"
                autosize={{ minRows: 6, maxRows: 12 }}
              />
            )}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={<span className="ant-form-item-required">Cover image</span>}
            className="upload-image-col"
            extra={uploadableImage ? null : 'Pick an image from your device'}
          >
            <Upload
              name="gathering"
              action="/upload.do"
              onChange={setUploadableImage}
              required
            >
              {uploadableImage ? (
                <Button>
                  <Icon type="check-circle" />
                  Image selected
                </Button>
              ) : (
                <Button>
                  <Icon type="upload" />
                  Pick an image
                </Button>
              )}
            </Upload>
          </FormItem>

          <FormItem
            wrapperCol={{
              xs: { span: 24, offset: 0 },
              sm: { span: 16, offset: 8 }
            }}
          >
            <Button type="primary" htmlType="submit">
              Continue
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(CreatePageForm);
