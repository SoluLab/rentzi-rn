import React from "react";
import { View, Modal as RNModal, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { shadow } from "@/constants/shadow";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: "slide" | "fade" | "none";
  transparent?: boolean;
}

const { height: screenHeight } = Dimensions.get("window");

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  animationType = "slide",
  transparent = true,
}) => {
  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
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
            {children}
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
    maxHeight: screenHeight * 0.9,
  },
  
  content: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    padding: spacing.lg,
    ...shadow.large,
  },
});