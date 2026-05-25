import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, { useRef, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import { count } from '../../utils/music'; 
import Instructions from '../../components/Instrctions/Instructions';
import './Yoga.css'
import DropDown from '../../components/DropDown/DropDown';
import { poseImages } from '../../utils/pose_images';
import { POINTS, keypointConnections } from '../../utils/data';
import { drawPoint, drawSegment } from '../../utils/helper'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

let skeletonColor = 'rgb(255,255,255)'
let poseList = [
  'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
  'Shoulderstand', 'Traingle', 'Mountain', 'Warrior2'
]

let flag = false

function Yoga() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const audioRef = useRef(null)
  const navigate = useNavigate()

  const [startingTime, setStartingTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [poseTime, setPoseTime] = useState(0)
  const [bestPerform, setBestPerform] = useState(0)
  const [currentPose, setCurrentPose] = useState('Tree')
  const [isStartPose, setIsStartPose] = useState(false)
  const [user, setUser] = useState(null)
  const [poseAccuracy, setPoseAccuracy] = useState(0)  // ← NEW

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if(userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // Fix negative number
  useEffect(() => {
    const timeDiff = (currentTime - startingTime)/1000
    if(flag) {
      if(timeDiff > 0) {
        setPoseTime(timeDiff)
      } else {
        setPoseTime(0)
      }
    }
    if(timeDiff > 0 && timeDiff > bestPerform) {
      setBestPerform(timeDiff)
    }
  }, [currentTime])

  useEffect(() => {
    setCurrentTime(0)
    setPoseTime(0)
    setBestPerform(0)
    setPoseAccuracy(0)  // ← Reset accuracy when pose changes
  }, [currentPose])

  const CLASS_NO = {
    Chair: 0,
    Cobra: 1,
    Dog: 2,
    Mountain: 3,
    No_Pose: 4,
    Shoulderstand: 5,
    Traingle: 6,
    Tree: 7,
    Warrior: 8,
    Warrior2: 9,
  }

  // ← NEW: Accuracy color function
 const getAccuracyColor = (accuracy) => {
    if(accuracy >= 70) return '#4CAF50'  // Green
    if(accuracy >= 40) return '#FFC107'  // Yellow
    if(accuracy >= 20) return '#FF9800'  // Orange
    return '#F44336'                      // Red
}

  // ← NEW: Accuracy label function
 const getAccuracyLabel = (accuracy) => {
    if(accuracy >= 70) return 'Excellent!'
    if(accuracy >= 40) return 'Good'
    if(accuracy >= 20) return 'Improving'
    return 'Try Again'
}

  function get_center_point(landmarks, left_bodypart, right_bodypart) {
    let left = tf.gather(landmarks, left_bodypart, 1)
    let right = tf.gather(landmarks, right_bodypart, 1)
    const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5))
    return center
  }

  function get_pose_size(landmarks, torso_size_multiplier=2.5) {
    let hips_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    let shoulders_center = get_center_point(landmarks, POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER)
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center))
    let pose_center_new = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    pose_center_new = tf.expandDims(pose_center_new, 1)
    pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2])
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0)
    let max_dist = tf.max(tf.norm(d, 'euclidean', 0))
    let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist)
    return pose_size
  }

  function normalize_pose_landmarks(landmarks) {
    let pose_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    pose_center = tf.expandDims(pose_center, 1)
    pose_center = tf.broadcastTo(pose_center, [1, 17, 2])
    landmarks = tf.sub(landmarks, pose_center)
    let pose_size = get_pose_size(landmarks)
    landmarks = tf.div(landmarks, pose_size)
    return landmarks
  }

  function landmarks_to_embedding(landmarks) {
    landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0))
    let embedding = tf.reshape(landmarks, [1, 34])
    return embedding
  }

  const runMovenet = async () => {
    const detectorConfig = { 
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER 
    }
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet, detectorConfig
    )
    const poseClassifier = await tf.loadLayersModel(
      'http://localhost:3000/model/model.json'
    )
    audioRef.current = new Audio(count)
    audioRef.current.loop = true

    intervalRef.current = setInterval(() => {
      detectPose(detector, poseClassifier)
    }, 100)
  }

  const detectPose = async (detector, poseClassifier) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      let notDetected = 0
      const video = webcamRef.current.video
      const pose = await detector.estimatePoses(video)
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      try {
        const keypoints = pose[0].keypoints
        let input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            if (!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
              drawPoint(ctx, keypoint.x, keypoint.y, 8, 'rgb(255,255,255)')
              let connections = keypointConnections[keypoint.name]
              try {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase()
                  drawSegment(ctx, [keypoint.x, keypoint.y],
                    [keypoints[POINTS[conName]].x, keypoints[POINTS[conName]].y],
                    skeletonColor)
                })
              } catch(err) {}
            }
          } else {
            notDetected += 1
          }
          return [keypoint.x, keypoint.y]
        })
        if (notDetected > 4) {
          skeletonColor = 'rgb(255,255,255)'
          if(audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
          }
          flag = false
          setPoseAccuracy(0)  // ← Reset accuracy when no person
          return
        }
        const processedInput = landmarks_to_embedding(input)
        const classification = poseClassifier.predict(processedInput)
        classification.array().then((data) => {
          const classNo = CLASS_NO[currentPose]

          // ← NEW: Calculate and set accuracy
       const rawAccuracy = data[0][classNo] * 100

let accuracy
if(isNaN(rawAccuracy) || 
   rawAccuracy === undefined) {
    // No person detected
    accuracy = 0
} else if(rawAccuracy === 0) {
    // Completely wrong pose
    accuracy = 0
} else if(rawAccuracy < 5) {
    // Very low confidence
    // Normalize to 20-25% range
    // for better user feedback
    accuracy = (20 + rawAccuracy * 2)
        .toFixed(1)
} else if(rawAccuracy < 20) {
    // Low confidence
    // Normalize to 25-40% range
    accuracy = (25 + rawAccuracy * 1.5)
        .toFixed(1)
} else if(rawAccuracy < 50) {
    // Medium confidence
    // Normalize to 40-60% range
    accuracy = (40 + rawAccuracy * 0.5)
        .toFixed(1)
} else {
    // High confidence
    // Show real value
    accuracy = rawAccuracy.toFixed(1)
}
setPoseAccuracy(accuracy)

          if (data[0][classNo] > 0.65) {
            if (!flag) {
              audioRef.current.play()
              setStartingTime(new Date(Date()).getTime())
              flag = true
            }
            setCurrentTime(new Date(Date()).getTime())
            skeletonColor = 'rgb(0,255,0)'
          } else {
            flag = false
            skeletonColor = 'rgb(255,255,255)'
            audioRef.current.pause()
            audioRef.current.currentTime = 0
          }
        })
      } catch(err) {
        console.log(err)
      }
    }
  }

  function startYoga() {
    setIsStartPose(true)
    runMovenet()
  }

  function stopPose() {
    setIsStartPose(false)
    clearInterval(intervalRef.current)
    if(audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    intervalRef.current = null

    // Save pose to database
    if(user && poseTime > 0) {
      axios.post('http://localhost:5000/api/poses/save', {
        user_id: user.id,
        pose_name: currentPose,
        hold_time: poseTime,
        best_score: bestPerform
      }).then(() => {
        console.log('Pose saved! ✅')
      }).catch(err => {
        console.log('Save error:', err)
      })
    }
  }

  if (isStartPose) {
    return (
      <div className="yoga-container">
        <div className="performance-container">

          {/* Pose Time */}
          <div className="pose-performance">
            <h4>Pose Time: {poseTime >= 60
              ? `${Math.floor(poseTime/60)}m ${Math.floor(poseTime%60)}s`
              : `${Math.floor(poseTime)}s`}
            </h4>
          </div>

          {/* Best Score */}
          <div className="pose-performance">
            <h4>Best: {bestPerform >= 60
              ? `${Math.floor(bestPerform/60)}m ${Math.floor(bestPerform%60)}s`
              : `${Math.floor(bestPerform)}s`}
            </h4>
          </div>

          {/* ← NEW: Pose Accuracy */}
          <div className="pose-performance">
            <h4 style={{color: getAccuracyColor(poseAccuracy)}}>
              🎯 Accuracy: {poseAccuracy}%
            </h4>
            <p style={{
              color: getAccuracyColor(poseAccuracy),
              fontSize: '12px',
              margin: '0'
            }}>
              {getAccuracyLabel(poseAccuracy)}
            </p>
          </div>

        </div>

        <div className="active-content">
          <div className="webcam-wrapper">
            <Webcam
              width='640px'
              height='480px'
              id="webcam"
              ref={webcamRef}
            />
            <canvas
              ref={canvasRef}
              id="my-canvas"
              width='640px'
              height='480px'
            />
          </div>
          <img
            src={poseImages[currentPose]}
            className="pose-img"
            alt={currentPose}
          />
        </div>

        <div className="btn-bottom">
          <button onClick={stopPose}
            className="secondary-btn">
            Stop Pose
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="yoga-container">
      <DropDown
        poseList={poseList}
        currentPose={currentPose}
        setCurrentPose={setCurrentPose}
      />
      <Instructions currentPose={currentPose} />
      <div className="btn-bottom">
        <button onClick={startYoga}
          className="secondary-btn">
          Start Pose
        </button>
        <button onClick={() => navigate('/dashboard')}
          className="secondary-btn">
          ← Dashboard
        </button>
      </div>
    </div>
  )
}

export default Yoga