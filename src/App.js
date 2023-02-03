import './App.css';
import {Input, Form, Card, Tabs, Button, Row, Col, DatePicker, Select, notification} from 'antd';
import axios from "axios";
import {useState} from "react";
import moment from "moment";

const ReportTypes = {
    TEST_REPORT: 'Test',
    PACKING_REPORT: 'Packing',
}
const URL = 'https://localhost:3002/api/v1/report/testReport'

function App() {
    const {TextArea} = Input;
    const {Option} = Select;
    const [api, contextHolder] = notification.useNotification();
    const [loading, setLoading] = useState(false)
    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()
    const handleFormSubmit = (val, type) => {
        setLoading(true)
        console.log(val, type)
        const query = val.query
        const email = val.email
        const stationId = val.stationId
        const maxTestId = val.maxTestId
        const minTestId = val.minTestId
        const status = val.status

        let dbQuery = undefined
        if (type === ReportTypes.TEST_REPORT) {
            if (query) {
                dbQuery = query
            }
            if (stationId && minTestId && maxTestId && startDate && endDate) {
                dbQuery = `SELECT * from tbl_device_serial_testing WHERE (station_id=${stationId}) AND (testid BETWEEN ${minTestId} AND ${maxTestId}) ORDER BY timeinserted DESC`
            }
            else if (stationId && minTestId && maxTestId) {
                dbQuery = `SELECT * from tbl_device_serial_testing WHERE (station_id=${stationId}) AND (testid BETWEEN ${minTestId} AND ${maxTestId}) AND timeinserted >'${startDate}' AND timeinserted <'${endDate}' ORDER BY timeinserted DESC`
            }
            else if (stationId && startDate && endDate && status) {
                dbQuery = `SELECT * from tbl_device_serial_testing WHERE (station_id=${stationId}) AND timeinserted >'${startDate}' AND timeinserted <'${endDate}' AND results ='${status}' ORDER BY timeinserted DESC`
            }
            else if (stationId && startDate && endDate) {
                dbQuery = `SELECT * from tbl_device_serial_testing WHERE (station_id=${stationId}) AND timeinserted >'${startDate}' AND timeinserted <'${endDate}' ORDER BY timeinserted DESC`
            }

        }

        if (dbQuery) {
            generateTestReport({query: dbQuery, email: email})
        } else {
            openError()
            setLoading(false)
        }
    }
    const generateTestReport = (body) => {
        axios.post(URL, body, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            }
        })
            .then(res => {
                setLoading(false)
                openSuccess()
                console.log(res)
            })
            .catch(error => {
                setLoading(false)
                openError()
                console.log(error)
            })

    }
    const openSuccess = () => {
        api.success({
            message: 'Sucess',
            description:
                'Report generated successfully',
            duration: 5,
        });
    };

    const openError = () => {
        api.error({
            message: 'Error',
            description:
                'Please check your values,Something went wrong',
            duration: 5,
        });
    };


    const items = [
        {
            key: '1',
            label: `Test Report By Database Query`,
            children:
                <div className='tab-item'>
                    <Form
                        name="testReportQuery"
                        style={{width: '100%'}}
                        onFinish={(val) => handleFormSubmit(val, ReportTypes.TEST_REPORT)}
                        layout={"vertical"}
                        // onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{required: true, message: 'Please input your email!'}]}
                        >
                            <Input type={'email'}/>
                        </Form.Item>

                        <Form.Item
                            label="Query"
                            name="query"
                            rules={[{required: true, message: 'Please input your Query!'}]}
                        >
                            <Input.TextArea/>
                        </Form.Item>
                        <Form.Item wrapperCol={{offset: 10, span: 3}} style={{marginTop: 30}}>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Generate Report
                            </Button>
                        </Form.Item>
                    </Form>
                </div>,
        },
        {
            key: '2',
            label: `Test Report By Filter`,
            children:
                <div className='tab-item'>
                    <Form
                        name="testReportFilter"
                        style={{width: '100%'}}
                        onFinish={(val) => handleFormSubmit(val, ReportTypes.TEST_REPORT)}
                        layout={"vertical"}
                        autoComplete="off"
                    >
                        <Row>
                            <Col span={11}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{required: true, message: 'Please input your email!'}]}
                                >
                                    <Input type={'email'}/>
                                </Form.Item>
                            </Col>
                            <Col span={11} offset={2}>
                                <Form.Item
                                    label="Station ID"
                                    name="stationId"
                                    // rules={[{required: true, message: 'Please input your Station ID!'}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}> <Form.Item
                                label="Minimum Test ID"
                                name="minTestId"
                                // rules={[{required: true, message: 'Please input your Test ID!'}]}
                            >
                                <Input/>
                            </Form.Item></Col>
                            <Col span={11} offset={2}> <Form.Item
                                label="Maximum Test ID"
                                name="maxTestId"
                                // rules={[{required: true, message: 'Please input your Test ID!'}]}
                            >
                                <Input/>
                            </Form.Item></Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                <Form.Item
                                    label="From Date"
                                    name="startDate"
                                    // rules={[{required: true, message: 'Please input your Date!'}]}
                                >
                                    <DatePicker onChange={(date, dateString) => setStartDate(dateString)}
                                                style={{width: '100%'}}/>
                                </Form.Item>
                            </Col>
                            <Col span={11} offset={2}>
                                <Form.Item
                                    label="To Date"
                                    name="endDate"
                                    // rules={[{required: true, message: 'Please input your Date!'}]}
                                >
                                    <DatePicker onChange={(date, dateString) => setEndDate(dateString)}
                                                style={{width: '100%'}}/>
                                </Form.Item>

                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                <Form.Item
                                    label="Status"
                                    name="status"
                                    // rules={[{required: true, message: 'Please input your Status!'}]}
                                >
                                    <Select placeholder="Please select a Status" allowClear>
                                        <Option value="PASSED">Passed</Option>
                                        <Option value="FAILED">Failed</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item wrapperCol={{offset: 10, span: 3}} style={{marginTop: 20}}>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Generate Report
                            </Button>
                        </Form.Item>
                    </Form>
                </div>,
        },
        {
            key: '3',
            label: `Packaging Report By Database Query`,
            children:
                <div className='tab-item'>
                    <Form
                        name="packagingReportQuery"
                        style={{width: '100%'}}
                        onFinish={handleFormSubmit}
                        layout={"vertical"}
                        // onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{required: true, message: 'Please input your email!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="Query"
                            name="query"
                            rules={[{required: true, message: 'Please input your Query!'}]}
                        >
                            <Input.TextArea/>
                        </Form.Item>
                        <Form.Item wrapperCol={{offset: 10, span: 3}} style={{marginTop: 30}}>
                            <Button type="primary" htmlType="submit">
                                Generate Report
                            </Button>
                        </Form.Item>
                    </Form>
                </div>,
        },
        {
            key: '4',
            label: `Packaging Report By Filter`,
            children: <div className='tab-item'>
                <Form
                    name="testReportFilter"
                    style={{width: '100%'}}
                    onFinish={handleFormSubmit}
                    layout={"vertical"}
                    // onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Row>
                        <Col span={11}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[{required: true, message: 'Please input your email!'}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={11} offset={2}>
                            <Form.Item
                                label="Lot Number"
                                name="lotNumber"
                                rules={[{required: true, message: 'Please input your Lot Number!'}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={11}> <Form.Item
                            label="Minimum  ID"
                            name="minId"
                            rules={[{required: true, message: 'Please input your ID!'}]}
                        >
                            <Input/>
                        </Form.Item></Col>
                        <Col span={11} offset={2}> <Form.Item
                            label="Maximum ID"
                            name="maxId"
                            rules={[{required: true, message: 'Please input your ID!'}]}
                        >
                            <Input/>
                        </Form.Item></Col>
                    </Row>
                    <Row>
                        <Col span={11}>
                            <Form.Item
                                label="Minimum Start Time"
                                name="date"
                                rules={[{required: true, message: 'Please input your Start Time!'}]}
                            >
                                <DatePicker style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={11} offset={2}>
                            <Form.Item
                                label="Maximum Start Time"
                                name="date"
                                rules={[{required: true, message: 'Please input your Start Time!'}]}
                            >
                                <DatePicker style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item wrapperCol={{offset: 10, span: 3}} style={{marginTop: 20}}>
                        <Button type="primary" htmlType="submit">
                            Generate Report
                        </Button>
                    </Form.Item>
                </Form>
            </div>,
        },
    ];
    return (
        <div className="App" className='container'>
            {contextHolder}
            <Card title="REPORTR" bordered={false} className='card'>
                <Tabs defaultActiveKey="1" items={items} className='card-item'/>
            </Card>
            {/*<header className="App-header">*/}
            {/*  <img src={logo} className="App-logo" alt="logo" />*/}
            {/*  <p>*/}
            {/*    Edit <code>src/App.js</code> and save to reload.*/}
            {/*  </p>*/}
            {/*  <a*/}
            {/*    className="App-link"*/}
            {/*    href="https://reactjs.org"*/}
            {/*    target="_blank"*/}
            {/*    rel="noopener noreferrer"*/}
            {/*  >*/}
            {/*    Learn React*/}
            {/*  </a>*/}
            {/*</header>*/}
        </div>
    );
}

export default App;
