import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { getActivityIcon } from '../utils/activityUtils';

const FilterModal = ({
  visible,
  onClose,
  activities,
  selectedFilter,
  onSelectFilter,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, isDark && styles.modalViewDark]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>
              Filter Activities
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {activities.map((activity) => {
              const isSelected = selectedFilter === activity.id;
              let IconComponent = null;

              if (activity.id !== 'all' && activity.icon) {
                IconComponent = getActivityIcon(activity.icon);
              }

              return (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.filterItem,
                    isSelected && styles.selectedItem,
                    isDark && styles.filterItemDark,
                    isSelected && isDark && styles.selectedItemDark,
                  ]}
                  onPress={() => onSelectFilter(activity.id)}>
                  {activity.id !== 'all' && IconComponent ? (
                    <View
                      style={[
                        styles.activityIcon,
                        { backgroundColor: activity.color },
                      ]}>
                      <IconComponent size={16} color="#FFFFFF" />
                    </View>
                  ) : null}
                  <Text
                    style={[
                      styles.filterItemText,
                      isDark && styles.textDark,
                      isSelected && styles.selectedItemText,
                    ]}>
                    {activity.name}
                  </Text>
                  {isSelected && (
                    <Check
                      size={20}
                      color={isDark ? '#007AFF' : '#007AFF'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '70%',
  },
  modalViewDark: {
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  textDark: {
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  filterItemDark: {
    backgroundColor: '#1C1C1E',
  },
  selectedItem: {
    backgroundColor: '#F2F2F7',
  },
  selectedItemDark: {
    backgroundColor: '#2C2C2E',
  },
  filterItemText: {
    fontSize: 16,
    flex: 1,
  },
  selectedItemText: {
    fontWeight: '500',
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});

export default FilterModal;