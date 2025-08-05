import React from "react";
import {
  View,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { shadow } from "@/constants/shadow";
import { Typography } from "./Typography";
import { X } from "lucide-react-native";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const { height: screenHeight } = Dimensions.get("window");

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
}) => {
  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Drag Handle */}
            <View style={styles.dragHandle}>
              <View style={styles.dragIndicator} />
            </View>
            
            {/* Header */}
            {title && (
              <View style={styles.header}>
                <Typography variant="h4" style={styles.title}>
                  {title}
                </Typography>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Content */}
            <ScrollView 
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
  },
  
  container: {
    maxHeight: screenHeight * 0.85,
  },
  
  content: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    ...shadow.large,
  },
  
  dragHandle: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.medium,
    borderRadius: 2,
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  
  title: {
    fontWeight: "600",
  },
  
  closeButton: {
    padding: spacing.xs,
  },
  
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
}); 