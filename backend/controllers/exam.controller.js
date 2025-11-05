const Exam = require("../models/exam.model");
const ApiResponse = require("../utils/ApiResponse");

const getAllExamsController = async (req, res) => {
  try {
    const { search = "", examType = "", class: classNum = "" } = req.query;

    let query = {};

    if (classNum) query.class = classNum;
    if (examType) query.examType = examType;

    const exams = await Exam.find(query).populate("schedules.subject");

    if (!exams || exams.length === 0) {
      return ApiResponse.error("No Exams Found", 404).send(res);
    }

    return ApiResponse.success(exams, "All Exams Loaded!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const addExamController = async (req, res) => {
  try {
    const { name, class: classNum, examType, totalMarks, startDate } = req.body;

    // Validate required fields
    if (!name || !classNum || !examType || !totalMarks || !startDate) {
      return ApiResponse.error("All fields are required (name, class, examType, totalMarks, startDate)", 400).send(res);
    }

    // Require timetable file upload
    if (!req.file) {
      return ApiResponse.error("Timetable image file is required", 400).send(res);
    }

    // Validate file is an image (check mimetype)
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(req.file.mimetype)) {
      return ApiResponse.error("Please upload an image file (JPEG, PNG, GIF, or WebP)", 400).send(res);
    }

    const formData = {
      name,
      class: Number(classNum),
      examType,
      totalMarks: Number(totalMarks),
      startDate: new Date(startDate),
      timetableLink: req.file.filename,
      schedules: [], // Empty schedules array since we're using image upload
    };

    const exam = await Exam.create(formData);
    return ApiResponse.success(exam, "Exam Added Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const updateExamController = async (req, res) => {
  try {
    const { name, class: classNum, examType, totalMarks, startDate } = req.body;

    // Validate required fields
    if (!name || !classNum || !examType || !totalMarks || !startDate) {
      return ApiResponse.error("All fields are required (name, class, examType, totalMarks, startDate)", 400).send(res);
    }

    // Check if exam exists
    const existingExam = await Exam.findById(req.params.id);
    if (!existingExam) {
      return ApiResponse.error("Exam not found", 404).send(res);
    }

    const formData = {
      name,
      class: Number(classNum),
      examType,
      totalMarks: Number(totalMarks),
      startDate: new Date(startDate),
      schedules: [], // Empty schedules array since we're using image upload
    };

    // Update timetable file if provided
    if (req.file) {
      // Validate file is an image
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(req.file.mimetype)) {
        return ApiResponse.error("Please upload an image file (JPEG, PNG, GIF, or WebP)", 400).send(res);
      }
      formData.timetableLink = req.file.filename;
    } else {
      // Keep existing timetable if not updating
      formData.timetableLink = existingExam.timetableLink;
    }

    const exam = await Exam.findByIdAndUpdate(req.params.id, formData, {
      new: true,
    });
    return ApiResponse.success(exam, "Exam Updated Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const deleteExamController = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    return ApiResponse.success(exam, "Exam Deleted Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

module.exports = {
  getAllExamsController,
  addExamController,
  updateExamController,
  deleteExamController,
};
