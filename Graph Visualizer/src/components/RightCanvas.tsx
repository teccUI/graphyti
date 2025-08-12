import { Box, IconButton, ButtonGroup, Tooltip } from '@mui/material'
import { Plus, Minus, ArrowsClockwise, ArrowsOutCardinal, ArrowLineLeft, CaretLeft, CaretRight } from 'phosphor-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useState } from 'react'
import GraphRenderer from '../GraphRenderer'

interface Graph {
  id: string
  name: string
  category: string
  subject: string
  level: string
  type: string
  equation_latex: string
  description: string
}

interface RightCanvasProps {
  selectedGraph: Graph | null
  onPreviousGraph: () => void
  onNextGraph: () => void
}

export default function RightCanvas({ selectedGraph, onPreviousGraph, onNextGraph }: RightCanvasProps) {
  const controlsRef = useRef<typeof OrbitControls | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [isPanMode, setIsPanMode] = useState(false)
  
  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false
      setIsRotating(false)
      setIsPanMode(false)
      controlsRef.current.enableRotate = true
      controlsRef.current.dollyIn(0.8)
      controlsRef.current.update()
    }
  }
  
  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false
      setIsRotating(false)
      setIsPanMode(false)
      controlsRef.current.enableRotate = true
      controlsRef.current.dollyOut(0.8)
      controlsRef.current.update()
    }
  }
  
  const handleRotate = () => {
    setIsRotating(!isRotating)
    setIsPanMode(false)
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !isRotating
      controlsRef.current.enableRotate = true
    }
  }
  
  const handlePan = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false
      setIsRotating(false)
      setIsPanMode(!isPanMode)
      // When in pan mode, disable rotation so only panning works
      controlsRef.current.enableRotate = isPanMode
      // Pan is always enabled for click-hold-drag behavior
      controlsRef.current.enablePan = true
    }
  }
  
  const handleXAxisView = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false
      setIsRotating(false)
      setIsPanMode(false)
      controlsRef.current.enableRotate = true
      controlsRef.current.object.position.set(10, 0, 0)
      controlsRef.current.object.lookAt(0, 0, 0)
      controlsRef.current.update()
    }
  }
  
  const handleYAxisView = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false
      setIsRotating(false)
      setIsPanMode(false)
      controlsRef.current.enableRotate = true
      controlsRef.current.object.position.set(0, 10, 0)
      controlsRef.current.object.lookAt(0, 0, 0)
      controlsRef.current.update()
    }
  }
  
  const handleZAxisView = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false
      setIsRotating(false)
      setIsPanMode(false)
      controlsRef.current.enableRotate = true
      controlsRef.current.object.position.set(0, 0, 10)
      controlsRef.current.object.lookAt(0, 0, 0)
      controlsRef.current.update()
    }
  }
  
  return (
    <Box sx={{
      position: 'relative',
      height: '100%',
      backgroundColor: '#f9fafb',
      borderRadius: '21px',
      overflow: 'hidden',
      padding: '6px'
    }}>
      {/* 3D Canvas Container */}
      <Box sx={{
        position: 'relative',
        height: '100%',
        backgroundColor: '#FDFDFD',
        borderRadius: '16px'
      }}>
        <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} />
          
          <OrbitControls 
            ref={controlsRef}
            enablePan 
            enableZoom 
            enableRotate 
            maxDistance={50}
            minDistance={2}
            autoRotate={isRotating}
            autoRotateSpeed={0.8}
          />
          
          {/* Grid and Axes */}
          {/* XZ Ground Plane Grid Lines */}
          <group rotation={[-Math.PI / 2, 0, 0]}>
            {Array.from({ length: 21 }, (_, i) => {
              const pos = i - 10;
              return (
                <group key={`xz-grid-${i}`}>
                  {/* Horizontal lines */}
                  <line>
                    <bufferGeometry>
                      <bufferAttribute 
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([-10, pos, 0, 10, pos, 0])}
                        itemSize={3}
                      />
                    </bufferGeometry>
                    <lineBasicMaterial color="#e0e0e0" transparent opacity={0.3} />
                  </line>
                  {/* Vertical lines */}
                  <line>
                    <bufferGeometry>
                      <bufferAttribute 
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([pos, -10, 0, pos, 10, 0])}
                        itemSize={3}
                      />
                    </bufferGeometry>
                    <lineBasicMaterial color="#e0e0e0" transparent opacity={0.3} />
                  </line>
                </group>
              );
            })}
          </group>
          
          {/* YZ Plane Grid Lines */}
          <group rotation={[0, Math.PI / 2, 0]}>
            {Array.from({ length: 21 }, (_, i) => {
              const pos = i - 10;
              return (
                <group key={`yz-grid-${i}`}>
                  {/* Horizontal lines */}
                  <line>
                    <bufferGeometry>
                      <bufferAttribute 
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([-10, pos, 0, 10, pos, 0])}
                        itemSize={3}
                      />
                    </bufferGeometry>
                    <lineBasicMaterial color="#e0e0e0" transparent opacity={0.3} />
                  </line>
                  {/* Vertical lines */}
                  <line>
                    <bufferGeometry>
                      <bufferAttribute 
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([pos, -10, 0, pos, 10, 0])}
                        itemSize={3}
                      />
                    </bufferGeometry>
                    <lineBasicMaterial color="#e0e0e0" transparent opacity={0.3} />
                  </line>
                </group>
              );
            })}
          </group>
          
          {/* X, Y, Z Axes Labels */}
          {/* Positive X */}
          <Text
            position={[10.5, 0, 0]}
            rotation={[0, 0, 0]}
            fontSize={0.8}
            color="red"
            anchorX="center"
            anchorY="middle"
          >
            X
          </Text>
          {/* Negative X */}
          <Text
            position={[-10.5, 0, 0]}
            rotation={[0, 0, 0]}
            fontSize={0.8}
            color="red"
            anchorX="center"
            anchorY="middle"
          >
            -X
          </Text>
          
          {/* Positive Y */}
          <Text
            position={[0, 10.5, 0]}
            rotation={[0, 0, 0]}
            fontSize={0.8}
            color="green"
            anchorX="center"
            anchorY="middle"
          >
            Y
          </Text>
          {/* Negative Y */}
          <Text
            position={[0, -10.5, 0]}
            rotation={[0, 0, 0]}
            fontSize={0.8}
            color="green"
            anchorX="center"
            anchorY="middle"
          >
            -Y
          </Text>
          
          {/* Positive Z */}
          <Text
            position={[0, 0, 10.5]}
            rotation={[0, 0, 0]}
            fontSize={0.8}
            color="blue"
            anchorX="center"
            anchorY="middle"
          >
            Z
          </Text>
          {/* Negative Z */}
          <Text
            position={[0, 0, -10.5]}
            rotation={[0, 0, 0]}
            fontSize={0.8}
            color="blue"
            anchorX="center"
            anchorY="middle"
          >
            -Z
          </Text>
          
          {/* Dynamic Graph Rendering */}
          {selectedGraph && <GraphRenderer graph={selectedGraph} />}
        </Canvas>
      </Box>

      {/* Floating Control Bar */}
      <Box sx={{
        position: 'absolute',
        bottom: '34px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        padding: '8px'
      }}>
        <ButtonGroup variant="outlined" size="small" sx={{ gap: '4px' }}>
            <Tooltip 
              title="Previous Graph"
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    color: '#111111',
                    fontSize: '12px',
                    padding: '4px 10px'
                  }
                }
              }}
            >
              <IconButton 
                sx={{ width: '30px', height: '30px', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                onClick={onPreviousGraph}
              >
                <CaretLeft size={16} color="#111111" />
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title="Next Graph"
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    color: '#111111',
                    fontSize: '12px',
                    padding: '4px 10px'
                  }
                }
              }}
            >
              <IconButton 
                sx={{ width: '30px', height: '30px', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                onClick={onNextGraph}
              >
                <CaretRight size={16} color="#111111" />
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title="Zoom In"
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    color: '#111111',
                    fontSize: '12px',
                    padding: '4px 10px'
                  }
                }
              }}
            >
              <IconButton 
                sx={{ width: '30px', height: '30px', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                onClick={handleZoomIn}
              >
                <Plus size={16} color="#111111" />
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title="Zoom Out"
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    color: '#111111',
                    fontSize: '12px',
                    padding: '4px 10px'
                  }
                }
              }}
            >
              <IconButton 
                sx={{ width: '30px', height: '30px', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                onClick={handleZoomOut}
              >
                <Minus size={16} color="#111111" />
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title="Rotate"
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    color: '#111111',
                    fontSize: '12px',
                    padding: '4px 10px'
                  }
                }
              }}
            >
              <IconButton 
                sx={{ 
                  width: '30px', 
                  height: '30px', 
                  border: isRotating ? '1px solid #ffffff' : '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  backgroundColor: isRotating ? '#111111' : 'transparent',
                  '& svg': {
                    color: isRotating ? '#ffffff' : '#111111'
                  },
                  '&:hover': {
                    backgroundColor: isRotating ? '#ffffff' : 'rgba(0, 0, 0, 0.04)',
                    border: isRotating ? '1px solid #e0e0e0' : '1px solid #e0e0e0',
                    '& svg': {
                      color: '#111111'
                    }
                  }
                }}
                onClick={handleRotate}
              >
                <ArrowsClockwise size={16} />
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title="Pan"
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    color: '#111111',
                    fontSize: '12px',
                    padding: '4px 10px'
                  }
                }
              }}
            >
              <IconButton 
                sx={{ 
                  width: '30px', 
                  height: '30px', 
                  border: isPanMode ? '1px solid #ffffff' : '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  backgroundColor: isPanMode ? '#111111' : 'transparent',
                  '& svg': {
                    color: isPanMode ? '#ffffff' : '#111111'
                  },
                  '&:hover': {
                    backgroundColor: isPanMode ? '#ffffff' : 'rgba(0, 0, 0, 0.04)',
                    border: isPanMode ? '1px solid #e0e0e0' : '1px solid #e0e0e0',
                    '& svg': {
                      color: '#111111'
                    }
                  }
                }}
                onClick={handlePan}
              >
                <ArrowsOutCardinal size={16} />
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title="Front View"
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    color: '#111111',
                    fontSize: '12px',
                    padding: '4px 10px'
                  }
                }
              }}
            >
              <IconButton 
                sx={{ width: '30px', height: '30px', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                onClick={handleXAxisView}
              >
                <ArrowLineLeft size={16} color="#111111" style={{ transform: 'rotate(-180deg)' }} />
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title="Side View"
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    color: '#111111',
                    fontSize: '12px',
                    padding: '4px 10px'
                  }
                }
              }}
            >
              <IconButton 
                sx={{ width: '30px', height: '30px', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                onClick={handleYAxisView}
              >
                <ArrowLineLeft size={16} color="#111111" style={{ transform: 'rotate(90deg)' }} />
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title="Top View"
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    color: '#111111',
                    fontSize: '12px',
                    padding: '4px 10px'
                  }
                }
              }}
            >
              <IconButton 
                sx={{ width: '30px', height: '30px', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                onClick={handleZAxisView}
              >
                <ArrowLineLeft size={16} color="#111111" style={{ transform: 'rotate(-90deg)' }} />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
      </Box>

    </Box>
  )
}