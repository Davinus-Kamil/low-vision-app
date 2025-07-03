import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { FileText } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Activity type for PDF
interface Activity {
  id: string;
  pdfPath?: string;
  pdfName?: string;
  action?: string;
  timestamp?: number;
  text?: string;
}

export default function PDFStorageScreen() {
  const [pdfs, setPdfs] = useState<Activity[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<Activity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      const log = await AsyncStorage.getItem('activityLog');
      const activityLog: Activity[] = log ? JSON.parse(log) : [];
      // Only show activities with pdfPath
      setPdfs(activityLog.filter((a) => a.pdfPath));
    } catch (error) {
      console.error('Error loading PDFs:', error);
    }
  };

  const handlePDFPress = (item: Activity) => {
    setSelectedPDF(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity style={styles.row} onPress={() => handlePDFPress(item)}>
      <FileText color="#007AFF" size={28} style={styles.icon} />
      <View style={styles.details}>
        <Text style={styles.pdfName}>{item.pdfName || 'PDF Document'}</Text>
        <Text style={styles.date}>{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</Text>
        {item.text ? <Text style={styles.textPreview} numberOfLines={1}>{item.text}</Text> : null}
      </View>
      <TouchableOpacity style={styles.openButton} onPress={() => handlePDFPress(item)}>
        <Text style={styles.openButtonText}>Open</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pdfs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No PDFs found.</Text>}
      />
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPDF && selectedPDF.pdfPath ? (
              Platform.OS === 'web' ? (
                <iframe
                  src={selectedPDF.pdfPath}
                  style={{ width: '100%', height: 400, border: 'none', marginBottom: 16 }}
                  title="PDF Preview"
                />
              ) : (
                (() => {
                  const PDFReader = require('react-native-pdf').default;
                  return (
                    <PDFReader
                      source={{ uri: selectedPDF.pdfPath }}
                      style={styles.pdfViewer}
                    />
                  );
                })()
              )
            ) : null}
            <Text style={styles.pdfName}>{selectedPDF?.pdfName || 'PDF Document'}</Text>
            <Text style={styles.date}>{selectedPDF?.timestamp ? new Date(selectedPDF.timestamp).toLocaleString() : ''}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
    elevation: 1,
  },
  icon: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  pdfName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  textPreview: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
  openButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  openButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '90%',
    maxHeight: '90%',
  },
  pdfViewer: {
    width: '100%',
    height: 400,
    marginBottom: 16,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 15,
  },
}); 